"""
测试企业会员权限检查逻辑
"""
import sys
sys.path.insert(0, '.')

from app.api.v1.endpoints.enterprise import check_enterprise_membership
from app.models.user import User
from fastapi import HTTPException

# 创建测试用户
def create_test_user(membership_type: str, member_tier: str, is_active: bool = True):
    user = User()
    user.id = 1
    user.email = "test@example.com"
    user.membership_type = membership_type
    user.member_tier = member_tier
    user.is_active = is_active
    return user

# 测试用例
test_cases = [
    # (membership_type, member_tier, is_active, should_pass, description)
    ("enterprise", "enterprise", True, True, "企业版会员 - 应该通过"),
    ("enterprise", "enterprise_pro", True, True, "企业专业版会员 - 应该通过"),
    ("enterprise", "enterprise_pro_max", True, True, "企业旗舰版会员 - 应该通过"),
    ("personal", "enterprise", True, False, "个人类型但企业等级 - 应该失败"),
    ("enterprise", "personal_pro", True, False, "企业类型但个人等级 - 应该失败"),
    ("enterprise", "enterprise", False, False, "企业会员但未激活 - 应该失败"),
]

print("=" * 80)
print("测试企业会员权限检查逻辑")
print("=" * 80)

for membership_type, member_tier, is_active, should_pass, description in test_cases:
    user = create_test_user(membership_type, member_tier, is_active)
    
    try:
        check_enterprise_membership(user)
        result = "✅ 通过"
        passed = True
    except HTTPException as e:
        result = f"❌ 拒绝 ({e.detail})"
        passed = False
    
    expected = "✅" if should_pass else "❌"
    status = "✅ 正确" if passed == should_pass else "❌ 错误"
    
    print(f"\n{description}")
    print(f"  会员类型: {membership_type}, 会员等级: {member_tier}, 激活: {is_active}")
    print(f"  预期: {expected}, 实际: {result}")
    print(f"  测试结果: {status}")

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)

