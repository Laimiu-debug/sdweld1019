"""
调试JWT token生成
"""
from app.core.security import create_access_token
from jose import jwt
from app.core.config import settings
import datetime

def debug_jwt_creation():
    print("=== JWT TOKEN CREATION DEBUG ===")
    print(f"Secret key: {settings.SECRET_KEY}")
    print(f"Algorithm: {settings.ALGORITHM}")

    # 创建token
    user_id = "3"
    access_token = create_access_token(user_id)

    print(f"Created token: {access_token}")
    print(f"Token type: {type(access_token)}")
    print(f"Token length: {len(access_token)}")

    # 检查token格式
    if '.' in access_token:
        print("Token has correct JWT format (contains dots)")
        parts = access_token.split('.')
        print(f"Token has {len(parts)} parts")

        try:
            # 尝试解码
            payload = jwt.decode(
                access_token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            print(f"Token payload: {payload}")
        except Exception as e:
            print(f"Failed to decode token: {e}")
    else:
        print("Token does NOT have JWT format (missing dots)")

        # 手动解码看看是什么
        try:
            import base64
            decoded = base64.b64decode(access_token + '==')  # 添加填充
            print(f"Base64 decoded: {decoded}")
        except Exception as e:
            print(f"Base64 decode failed: {e}")

    # 测试验证
    from app.core.security import verify_token
    verified_id = verify_token(access_token, "access")
    print(f"Verified user ID: {verified_id}")

if __name__ == "__main__":
    debug_jwt_creation()