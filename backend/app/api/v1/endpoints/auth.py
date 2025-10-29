"""
Authentication endpoints for the welding system backend.
"""
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    generate_password_reset_token,
    verify_password_reset_token,
    verify_token,
)
from app.schemas.token import Token, TokenWithUser, TokenRefresh
from app.schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from app.schemas.verification_code import (
    VerificationCodeRequest,
    VerificationCodeResponse,
    LoginWithVerificationCode
)
from app.services.user_service import user_service
from app.services.verification_service import verification_service
from app.services.email_service import email_service
from app.services.sms_service import sms_service
from pydantic import BaseModel

class RegisterResponse(BaseModel):
    """Register response model."""
    message: str
    user_id: int
    email: str
    full_name: str

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    用户登录获取访问令牌 (OAuth2表单格式).

    Args:
        request: HTTP请求对象
        db: 数据库会话
        form_data: OAuth2密码表单

    Returns:
        JWT令牌信息

    Raises:
        HTTPException: 如果用户名或密码错误
    """
    # 验证用户凭据
    user = user_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账户已被禁用"
        )

    # 在开发环境中跳过邮箱验证
    if not settings.DEVELOPMENT and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先验证邮箱地址"
        )

    # 更新最后登录时间和IP
    client_ip = request.client.host
    if 'x-forwarded-for' in request.headers:
        client_ip = request.headers['x-forwarded-for']
    elif 'x-real-ip' in request.headers:
        client_ip = request.headers['x-real-ip']

    # 使用本地时间而不是UTC时间
    from datetime import datetime
    import pytz

    # 获取中国时区
    china_tz = pytz.timezone('Asia/Shanghai')
    local_time = datetime.now(china_tz)

    user.last_login_at = local_time
    user.last_login_ip = client_ip
    db.commit()

    print(f"用户登录成功: {user.email}, IP: {client_ip}, 时间: {user.last_login_at}")

    # 创建访问令牌和刷新令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        subject=user.id,
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/login-json", response_model=TokenWithUser)
async def login_with_json(  # Updated to support phone/email login
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    用户登录获取访问令牌 (JSON格式，支持邮箱/手机号).

    Args:
        request: HTTP请求对象
        login_data: 登录请求数据
        db: 数据库会话

    Returns:
        JWT令牌信息和用户信息

    Raises:
        HTTPException: 如果账号或密码错误
    """
    # 检测账号类型
    account_type = verification_service.detect_account_type(login_data.account)

    # 根据账号类型查找用户
    user = None
    if account_type == "email":
        user = user_service.get_by_email(db, email=login_data.account)
    elif account_type == "phone":
        user = user_service.get_by_phone(db, phone=login_data.account)
    else:
        # 如果不是标准格式，尝试按contact查找
        user = user_service.get_by_contact(db, contact=login_data.account)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误"
        )

    # 验证密码
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误"
        )

    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账户已被禁用"
        )

    # 在开发环境中跳过邮箱验证
    if not settings.DEVELOPMENT and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先验证邮箱地址"
        )

    # 更新最后登录时间和IP
    client_ip = request.client.host
    if 'x-forwarded-for' in request.headers:
        client_ip = request.headers['x-forwarded-for']
    elif 'x-real-ip' in request.headers:
        client_ip = request.headers['x-real-ip']

    # 使用本地时间而不是UTC时间
    import pytz
    china_tz = pytz.timezone('Asia/Shanghai')
    local_time = datetime.now(china_tz)

    user.last_login_at = local_time
    user.last_login_ip = client_ip
    db.commit()

    print(f"用户登录成功(JSON): {user.email}, IP: {client_ip}, 时间: {user.last_login_at}")

    # 创建访问令牌和刷新令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        subject=user.id,
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.model_validate(user)
    }


@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    token_refresh: TokenRefresh,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    使用刷新令牌获取新的访问令牌.

    Args:
        token_refresh: 刷新令牌请求
        db: 数据库会话

    Returns:
        新的JWT令牌信息

    Raises:
        HTTPException: 如果刷新令牌无效
    """
    # 验证刷新令牌
    user_id = verify_token(token_refresh.refresh_token, token_type="refresh")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )

    # 获取用户信息
    user = user_service.get(db, id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已被禁用"
        )

    # 创建新的访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": token_refresh.refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/register", response_model=dict)
async def register_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db)
) -> dict:
    """
    用户注册.

    Args:
        user_in: 用户创建数据
        db: 数据库会话

    Returns:
        注册成功消息

    Raises:
        HTTPException: 如果邮箱已存在
    """
    print(f"📝 收到注册请求: email={user_in.email}, username={user_in.username}")

    # 检查邮箱是否已存在
    user = user_service.get_by_email(db, email=user_in.email)
    if user:
        print(f"❌ 邮箱已存在: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )

    # 创建用户
    try:
        print(f"🔨 开始创建用户...")
        user = user_service.create(db, obj_in=user_in)
        print(f"用户创建成功: id={user.id}, email={user.email}")

        # 只返回基本成功消息，避免任何datetime字段
        response = {"message": "注册成功"}
        print(f"📤 返回响应: {response}")
        return response
    except Exception as e:
        print(f"❌ 用户创建失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"用户创建失败: {str(e)}"
        )


@router.post("/logout")
async def logout_user(
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    用户登出.

    Args:
        current_user: 当前用户信息

    Returns:
        登出成功消息
    """
    # 在实际应用中，可以将令牌加入黑名单
    # 这里只是简单返回成功消息
    return {"message": "登出成功"}


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    修改密码.

    Args:
        current_password: 当前密码
        new_password: 新密码
        current_user: 当前用户信息
        db: 数据库会话

    Returns:
        修改成功消息

    Raises:
        HTTPException: 如果当前密码错误
    """
    # 获取用户完整信息
    user = user_service.get(db, id=current_user["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 验证当前密码
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前密码错误"
        )

    # 更新密码
    user.hashed_password = get_password_hash(new_password)
    await db.commit()

    return {"message": "密码修改成功"}


@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    忘记密码.

    Args:
        email: 用户邮箱
        db: 数据库会话

    Returns:
        重置邮件发送状态

    Raises:
        HTTPException: 如果邮箱不存在
    """
    user = user_service.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该邮箱未注册"
        )

    # 生成密码重置令牌
    reset_token = generate_password_reset_token(email)

    # 这里应该发送邮件，暂时只返回令牌（开发环境）
    if settings.DEVELOPMENT:
        return {
            "message": "密码重置邮件已发送",
            "reset_token": reset_token  # 仅开发环境返回
        }
    else:
        # 生产环境发送邮件
        # TODO: 实现邮件发送功能
        return {"message": "密码重置邮件已发送"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    重置密码.

    Args:
        token: 密码重置令牌
        new_password: 新密码
        db: 数据库会话

    Returns:
        重置成功消息

    Raises:
        HTTPException: 如果令牌无效
    """
    # 验证重置令牌
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效或已过期的重置令牌"
        )

    # 获取用户
    user = user_service.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 更新密码
    user.hashed_password = get_password_hash(new_password)
    await db.commit()

    return {"message": "密码重置成功"}


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    验证邮箱.

    Args:
        token: 邮箱验证令牌
        db: 数据库会话

    Returns:
        验证成功消息

    Raises:
        HTTPException: 如果令牌无效
    """
    # TODO: 实现邮箱验证逻辑
    return {"message": "邮箱验证成功"}




@router.post("/resend-verification")
async def resend_verification_email(
    email: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    重新发送验证邮件.

    Args:
        email: 用户邮箱
        db: 数据库会话

    Returns:
        发送状态

    Raises:
        HTTPException: 如果邮箱不存在
    """
    user = user_service.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该邮箱未注册"
        )

    # TODO: 实现邮件重新发送逻辑
    return {"message": "验证邮件已重新发送"}


@router.post("/send-verification-code", response_model=VerificationCodeResponse)
async def send_verification_code(
    request: VerificationCodeRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    发送验证码.

    Args:
        request: 验证码请求
        db: 数据库会话

    Returns:
        发送状态

    Raises:
        HTTPException: 如果账号格式错误或发送失败
    """
    # 检查账号格式
    account_type = verification_service.detect_account_type(request.account)
    if account_type != request.account_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号格式与类型不匹配"
        )

    # 检查用户是否存在（对于登录）
    if request.purpose == "login":
        user = user_service.get_by_contact(db, contact=request.account)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="该账号未注册"
            )

    # 检查发送频率限制
    if not verification_service.can_send_code(
        db, request.account, request.account_type, request.purpose
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送验证码过于频繁，请稍后再试"
        )

    try:
        # 创建验证码
        verification_code = verification_service.create_verification_code(
            db=db,
            account=request.account,
            account_type=request.account_type,
            purpose=request.purpose,
            expires_minutes=10
        )

        # 发送验证码
        send_success = False

        if request.account_type == "email":
            # 发送邮件验证码
            send_success = email_service.send_verification_code(
                to_email=request.account,
                code=verification_code.code,
                purpose=request.purpose,
                expires_minutes=10
            )
        elif request.account_type == "phone":
            # 发送短信验证码
            send_success = sms_service.send_verification_code(
                phone=request.account,
                code=verification_code.code,
                purpose=request.purpose,
                expires_minutes=10
            )

        # 开发环境：即使发送失败也返回成功（用于测试）
        if settings.DEVELOPMENT:
            print(f"🔐 [开发环境] 验证码: {verification_code.code}")
            return {
                "message": f"验证码已发送到您的{'邮箱' if request.account_type == 'email' else '手机'}（开发环境：{verification_code.code}）",
                "expires_in": 600,
                "code": verification_code.code  # 开发环境返回验证码
            }

        # 生产环境：检查发送结果
        if not send_success:
            # 发送失败，标记验证码为已使用
            verification_code.is_used = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"发送{'邮件' if request.account_type == 'email' else '短信'}失败，请稍后重试"
            )

        return {
            "message": f"验证码已发送到您的{'邮箱' if request.account_type == 'email' else '手机'}",
            "expires_in": 600
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ 发送验证码异常: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="发送验证码失败，请稍后重试"
        )


@router.post("/login-with-verification-code", response_model=Token)
async def login_with_verification_code(
    request: Request,
    login_data: LoginWithVerificationCode,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    使用验证码登录.

    Args:
        request: HTTP请求对象
        login_data: 验证码登录请求
        db: 数据库会话

    Returns:
        JWT令牌信息

    Raises:
        HTTPException: 如果验证码错误或账号不存在
    """
    # 检查账号格式
    account_type = verification_service.detect_account_type(login_data.account)
    if account_type != login_data.account_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号格式与类型不匹配"
        )

    # 查找用户
    user = user_service.get_by_contact(db, contact=login_data.account)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该账号未注册"
        )

    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账户已被禁用"
        )

    # 验证验证码
    verification_code = verification_service.verify_code(
        db=db,
        account=login_data.account,
        code=login_data.verification_code,
        account_type=login_data.account_type,
        purpose="login"
    )

    if not verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码错误或已过期"
        )

    # 在开发环境中跳过邮箱验证
    if not settings.DEVELOPMENT and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先验证邮箱地址"
        )

    # 更新最后登录时间和IP
    client_ip = request.client.host
    if 'x-forwarded-for' in request.headers:
        client_ip = request.headers['x-forwarded-for']
    elif 'x-real-ip' in request.headers:
        client_ip = request.headers['x-real-ip']

    # 使用本地时间而不是UTC时间
    import pytz
    china_tz = pytz.timezone('Asia/Shanghai')
    local_time = datetime.now(china_tz)

    user.last_login_at = local_time
    user.last_login_ip = client_ip
    db.commit()

    print(f"用户登录成功(验证码): {user.email}, IP: {client_ip}, 时间: {user.last_login_at}")

    # 创建访问令牌和刷新令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        subject=user.id,
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }