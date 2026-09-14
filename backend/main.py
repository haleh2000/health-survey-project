(venv) PS C:\Users\ha_jafari\projects\health-assesment\backend> Get-ChildItem .. -Recurse -Force -File | Select-String "DATABASE_URL"

C:\Users\ha_jafari\projects\health-assesment\docker-compose.yml:38:      DATABASE_URL: mysql+pymysql://health_app:${DB_APP_PASSWORD}@db:3306/health_survey
database.py:9:DATABASE_URL = os.getenv("DATABASE_URL")
database.py:10:if not DATABASE_URL:
database.py:11:    raise RuntimeError("DATABASE_URL environment variable is not set")
database.py:14:    DATABASE_URL,
__pycache__\database.cpython-314.pyc:9:create_engine�text)�
                                                           sessionmaker�DeclarativeBase�
                                                                                        DATABASE_URLz,DATABASE_URL environment variable is not setTiF)�
C:\Users\ha_jafari\projects\health-assesment\health-survey-project\docker-compose.yml:38:      DATABASE_URL: mysql+pymysql://health_app:${DB_APP_PASSWORD}@db:3306/health_survey
C:\Users\ha_jafari\projects\health-assesment\health-survey-project\backend\database.py:9:DATABASE_URL = os.getenv("DATABASE_URL")
C:\Users\ha_jafari\projects\health-assesment\health-survey-project\backend\database.py:10:if not DATABASE_URL:
C:\Users\ha_jafari\projects\health-assesment\health-survey-project\backend\database.py:11:    raise RuntimeError("DATABASE_URL environment variable is not set")
C:\Users\ha_jafari\projects\health-assesment\health-survey-project\backend\database.py:14:    DATABASE_URL,
