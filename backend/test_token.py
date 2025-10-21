"""
测试JWT token验证
"""
from app.core.security import verify_token
from jose import jwt
from app.core.config import settings

def test_token():
    # 从登录API得到的token
    token = "MzoxNzYwNzA2NTczOmFkbWlu"

    print(f"Testing token: {token}")
    print(f"Secret key: {settings.SECRET_KEY}")
    print(f"Algorithm: {settings.ALGORITHM}")

    # 尝试验证token
    admin_id = verify_token(token, token_type="access")
    print(f"Verified admin_id: {admin_id}")

    # 手动解码token看看内容
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        print(f"Token payload: {payload}")
    except Exception as e:
        print(f"Failed to decode token: {e}")
        # 尝试不验证签名解码
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            print(f"Token payload (no verification): {payload}")
        except Exception as e2:
            print(f"Failed to decode without verification: {e2}")

if __name__ == "__main__":
    test_token()