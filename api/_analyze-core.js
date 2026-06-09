/**
 * AI 분석 공통 로직 (로컬 server.js + Vercel api/analyze.js 공유)
 *
 * 프론트엔드가 보낸 "센서 요약본"(원시 시계열이 아닌 집계 지표)을 받아
 * OpenAI Chat Completions API로 보내고, 구조화된 분석 결과(JSON)를 돌려준다.
 *
 *  - 브리핑      : 현재 상황 자연어 요약
 *  - 급변 감지   : 임계치 미만이라도 비정상적으로 빠르게 상승 중인 센서
 *  - 우선순위    : 심각도 + 추세 + 장비정보를 종합한 점검 우선순위
 */

const SYSTEM_PROMPT = `당신은 한국지역난방공사의 열수송관 IoT 온도센서 관제 데이터를 분석하는 전문 분석가입니다.
열수송관 온도 이상은 누수, 단열 파손, 과열 등을 의미할 수 있어 신속한 판단이 중요합니다.
모든 출력은 한국어로, 현장 관제사가 즉시 이해하고 조치할 수 있게 간결하고 실무적으로 작성합니다.

입력으로 임계치 설정과 센서별 집계 지표를 받습니다. 각 센서 지표의 의미:
- latestTemp: 가장 최근 측정 온도(°C), status: 현재 상태(normal/warning/danger)
- firstTemp/firstTime ~ latestTemp/latestTime: 측정 구간의 처음과 끝
- ratePerHour: 전체 구간 평균 시간당 온도 변화율(°C/h)
- recentRatePerHour: 가장 최근 구간의 시간당 변화율(°C/h) — 급변 판단의 핵심
- deltaTotal: 전체 구간 온도 변화량(°C)
- maxTemp/minTemp, count(측정 횟수), spanHours(측정 구간 길이)
- device: 매칭된 장비 정보(model 모델, facilityType 시설구분, installYear 설치연도, ageYears 사용연수, address 설치주소)

반드시 아래 JSON 스키마로만 응답하세요(추가 텍스트 금지):
{
  "briefing": "string — 전체 상황 2~4문장 요약. 위험/경고 건수, 가장 주목할 센서와 그 이유를 포함.",
  "rapidChanges": [
    {
      "id": "센서ID",
      "name": "센서명/위치",
      "ratePerHour": number,           // 가장 의미있는 변화율(보통 recentRatePerHour)
      "currentTemp": number,           // 현재 온도
      "severity": "high" | "medium" | "low",
      "reason": "왜 급변으로 판단했는지 한 줄 (임계치 미만이어도 빠른 상승이면 포함)"
    }
  ],
  "priorities": [
    {
      "rank": number,                  // 1부터
      "id": "센서ID",
      "name": "센서명/위치",
      "level": "위험" | "경고" | "주의",
      "action": "권장 조치 한 줄 (예: 즉시 현장 점검, 원격 재확인 등)",
      "reason": "우선순위를 그렇게 매긴 근거 (온도/추세/장비 노후·시설구분 종합)"
    }
  ]
}

판단 지침:
- rapidChanges: 절대 온도가 낮거나 임계치 미만이어도 recentRatePerHour가 비정상적으로 높으면(가파른 상승) 반드시 포함. 안정적이거나 하강 중인 센서는 제외. 해당 없으면 빈 배열.
- priorities: 단순 온도 순이 아니라 (현재 심각도 + 상승 추세 + 장비 노후/시설구분)을 종합. 위험·급상승·노후 장비가 겹치면 최상위. 조치가 필요한 센서만 포함(보통 3~7개), 정상·안정 센서는 제외.
- 데이터에 없는 사실을 지어내지 말 것.`;

/**
 * @param {object} payload  { thresholds:{warning,danger}, period, counts, sensors:[...] }
 * @param {object} env      { apiKey, model }
 * @returns {Promise<object>} { briefing, rapidChanges, priorities, _model }
 */
async function runAnalysis(payload, env) {
  const apiKey = env.apiKey;
  if (!apiKey) {
    const e = new Error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일 또는 환경변수를 확인하세요.');
    e.statusCode = 500;
    throw e;
  }
  if (!payload || !Array.isArray(payload.sensors) || payload.sensors.length === 0) {
    const e = new Error('분석할 센서 데이터가 없습니다.');
    e.statusCode = 400;
    throw e;
  }

  const model = env.model || 'gpt-4o-mini';

  const userContent =
    '다음은 현재 열수송관 온도센서 모니터링 데이터입니다. 분석해 주세요.\n\n' +
    JSON.stringify(payload);

  const body = {
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const e = new Error(`OpenAI API 오류 (${resp.status}): ${text.slice(0, 300)}`);
    e.statusCode = 502;
    throw e;
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '{}';

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const e = new Error('AI 응답을 해석할 수 없습니다.');
    e.statusCode = 502;
    throw e;
  }

  return {
    briefing: parsed.briefing || '',
    rapidChanges: Array.isArray(parsed.rapidChanges) ? parsed.rapidChanges : [],
    priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
    _model: model,
  };
}

module.exports = { runAnalysis };
