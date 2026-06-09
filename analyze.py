import pandas as pd
import sys
import warnings
warnings.filterwarnings('ignore')
sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_excel(r'C:\Users\User\Downloads\devList_20260609125246894.xlsx', sheet_name=0)

# 장비 모델 분포
print('=== 장비 모델 분포 ===')
print(df['장비 모델'].value_counts().to_string())

# 조직별 분포
print()
print('=== 조직 분포 ===')
print(df['조직'].value_counts().to_string())

# 설치 주소에서 시/도, 시군구 추출
df['시도'] = df['설치 주소'].str.split(' ').str[0]
df['시군구'] = df['설치 주소'].str.split(' ').str[1]

print()
print('=== 시도별 장비 수 ===')
print(df['시도'].value_counts().to_string())

print()
print('=== 시군구별 장비 수 (상위 20) ===')
print(df['시군구'].value_counts().head(20).to_string())

# 장비명 고유 수
print()
print(f'총 고유 장비 수: {df["장비 이름"].nunique()}')
print(f'장비 이름 샘플: {list(df["장비 이름"].head(10))}')

# 등록일 연도별 추이
df['등록연도'] = pd.to_datetime(df['장비 등록일']).dt.year
print()
print('=== 연도별 등록 추이 ===')
print(df['등록연도'].value_counts().sort_index().to_string())

# 시설명 NULL 아닌 것 상위
print()
print('=== 시설명 상위 10 (NULL 제외) ===')
print(df['시설명'].dropna().value_counts().head(10).to_string())

# 시설 구분 분포
print()
print('=== 시설 구분 분포 ===')
print(df['시설 구분'].dropna().value_counts().to_string())

# 장비 설치일 vs 등록일 비교
df['등록일dt'] = pd.to_datetime(df['장비 등록일'])
df['설치일dt'] = pd.to_datetime(df['장비 설치일'])
diff = (df['설치일dt'] - df['등록일dt']).dt.days
print()
print('=== 등록일 ~ 설치일 차이(일) 통계 ===')
print(diff.describe().to_string())

# 좌표 없는 경우
no_coord = df[(df['위도'].isna()) | (df['경도'].isna())]
print()
print(f'좌표 없는 장비: {len(no_coord)}건')
