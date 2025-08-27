# RaksilCheck

> **설명**: RaksilCheck는 사용자가 직접 

##  기능 및 개요
- **PWA 및 오프라인 대응**: service worker를 통한 오프라인 기능 지원 (`sw.js`, `register-sw.js` 포함)
- **모바일 앱처럼 설치 가능**: `manifest.json`을 통해 홈 화면에 설치 가능
- **인터페이스 구성**:
  - `index.html`: 기본 안내 페이지
  - `main.css`: 스타일 정의
  - `app.js`: 메인 기능 실행 로직
- **아이콘 관리**: `/icons` 폴더 내 다양한 해상도 아이콘 제공

##  시작하기
### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/CMBJP/RaksilCheck.git
cd RaksilCheck

# 간단한 HTTP 서버 실행 (예: Python 사용 시)
python3 -m http.server 8000

# 또는 VSCode Live Server, npm 패키지 활용 가능
