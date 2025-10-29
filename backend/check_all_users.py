"""
检查所有用户账户的详细信息
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()

print("=" * 80)
print("所有用户账户详细信息")
print("=" * 80)

# 查询所有用户
all_users = db.query(User).all()

print(f"\n总共 {len(all_users)} 个账户\n")

for i, user in enumerate(all_users, 1):
    is_bcrypt = user.hashed_password.startswith('$2b$')
    
    print(f"{i}. {user.email}")
    print(f"   用户名: {user.username}")
    print(f"   是否激活 (is_active): {user.is_active}")
    print(f"   是否验证 (is_verified): {user.is_verified}")
    print(f"   是否超级用户 (is_superuser): {user.is_superuser}")
    print(f"   会员等级 (member_tier): {user.member_tier}")
    print(f"   密码格式: {'✅ bcrypt' if is_bcrypt else '❌ 非bcrypt'}")
    print(f"   密码哈希前缀: {user.hashed_password[:20]}")
    print(f"   密码哈希长度: {len(user.hashed_password)}")
    
    # 如果是bcrypt格式，测试常见密码
    if is_bcrypt:
        test_passwords = ['password123', 'Welcome123!', 'test123', '123456', 'password']
        matched = False
        for pwd in test_passwords:
            try:
                if verify_password(pwd, user.hashed_password):
                    print(f"   🔑 密码: {pwd}")
                    matched = True
                    break
            except:
                pass
        if not matched:
            print(f"   🔑 密码: (未知)")
    
    print()

print("=" * 80)
print("问题账户统计")
print("=" * 80)

inactive_users = [u for u in all_users if not u.is_active]
unverified_users = [u for u in all_users if not u.is_verified]
non_bcrypt_users = [u for u in all_users if not u.hashed_password.startswith('$2b$')]

print(f"\n未激活账户 (is_active=False): {len(inactive_users)}")
for user in inactive_users:
    print(f"  - {user.email}")

print(f"\n未验证账户 (is_verified=False): {len(unverified_users)}")
for user in unverified_users:
    print(f"  - {user.email}")

print(f"\n非bcrypt格式密码: {len(non_bcrypt_users)}")
for user in non_bcrypt_users:
    print(f"  - {user.email}")

db.close()

