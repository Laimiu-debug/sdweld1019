"""
综合调试JWT token生成流程
"""
import requests
import json
from datetime import timedelta
from app.core.security import create_access_token
from app.core.config import settings

def test_direct_token_generation():
    """直接测试token生成函数"""
    print("=== 直接测试 token 生成 ===")

    # 直接调用create_access_token
    admin_id = "3"
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    print(f"Admin ID: {admin_id}")
    print(f"Secret key: {settings.SECRET_KEY}")
    print(f"Algorithm: {settings.ALGORITHM}")
    print(f"Token expire minutes: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")

    token = create_access_token(
        subject=admin_id,
        expires_delta=expires_delta
    )

    print(f"Generated token: {token}")
    print(f"Token type: {type(token)}")
    print(f"Token length: {len(token)}")

    # 检查token格式
    if '.' in token:
        parts = token.split('.')
        print(f"Token parts count: {len(parts)}")
        print(f"Header: {parts[0]}")
        print(f"Payload: {parts[1]}")
        print(f"Signature: {parts[2]}")
    else:
        print("WARNING: Token doesn't contain dots - not a proper JWT format!")

    return token

def test_login_api():
    """测试登录API"""
    print("\n=== 测试登录 API ===")

    login_url = "http://localhost:8000/api/v1/admin/auth/login"

    # 使用表单数据
    data = {
        'username': 'Laimiu',
        'password': 'admin123'
    }

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    }

    print(f"Login URL: {login_url}")
    print(f"Request data: {data}")
    print(f"Headers: {headers}")

    try:
        response = requests.post(
            login_url,
            data=data,
            headers=headers
        )

        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")

        if response.status_code == 200:
            response_data = response.json()
            print(f"Response data: {json.dumps(response_data, indent=2, ensure_ascii=False)}")

            if 'access_token' in response_data:
                token = response_data['access_token']
                print(f"\n=== Token 分析 ===")
                print(f"Token from API: {token}")
                print(f"Token type: {type(token)}")
                print(f"Token length: {len(token)}")

                # 检查token格式
                if '.' in token:
                    parts = token.split('.')
                    print(f"Token parts count: {len(parts)}")
                    print(f"Header: {parts[0]}")
                    print(f"Payload: {parts[1]}")
                    print(f"Signature: {parts[2]}")
                else:
                    print("WARNING: API返回的token不包含点号 - 不是正确的JWT格式!")

                    # 尝试解码
                    try:
                        import base64
                        decoded = base64.b64decode(token).decode('utf-8')
                        print(f"Base64解码结果: {decoded}")
                    except Exception as e:
                        print(f"Base64解码失败: {e}")
            else:
                print("ERROR: Response doesn't contain access_token")
        else:
            print(f"ERROR: Login failed with status {response.status_code}")
            print(f"Error response: {response.text}")

    except Exception as e:
        print(f"Request failed: {e}")

def compare_tokens():
    """比较直接生成的token和API返回的token"""
    print("\n=== 比较 Token ===")

    direct_token = test_direct_token_generation()
    test_login_api()

    print(f"\n直接生成的token: {direct_token}")
    print(f"API返回的token需要从上面查看")

    return direct_token

if __name__ == "__main__":
    print("开始综合调试JWT token生成流程...")
    compare_tokens()