import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  List,
  Avatar,
  Tag,
  Tooltip,
} from 'antd'
import {
  FileTextOutlined,
  ExperimentOutlined,
  SettingOutlined,
  DatabaseOutlined,
  TeamOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  PartitionOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CrownOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { DashboardStats, WPSRecord, PQRRecord } from '@/types'

const { Title, Text, Paragraph } = Typography

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentWPS, setRecentWPS] = useState<WPSRecord[]>([])
  const [recentPQR, setRecentPQR] = useState<PQRRecord[]>([])
  const navigate = useNavigate()
  const { user, checkPermission, canCreateMore } = useAuthStore()

  // 判断是否为游客模式
  const isGuestMode = !user

  useEffect(() => {
    // 模拟数据加载
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // 这里应该调用API获取实际数据
        // const statsData = await dashboardService.getStats()
        // const wpsData = await wpsService.getRecent()
        // const pqrData = await pqrService.getRecent()

        // 模拟数据
        const mockStats: DashboardStats = {
          wps_count: 15,
          pqr_count: 8,
          ppqr_count: 3,
          materials_count: 25,
          welders_count: 12,
          equipment_count: 6,
          active_tasks: 4,
          pending_inspections: 2,
          storage_used_mb: 125,
          storage_limit_mb: 500,
          membership_usage: {
            wps_usage: 15,
            pqr_usage: 8,
            ppqr_usage: 3,
            materials_usage: 25,
            welders_usage: 12,
            equipment_usage: 6,
          },
        }

        const mockRecentWPS: WPSRecord[] = [
          {
            id: '1',
            wps_number: 'WPS-2024-001',
            title: '碳钢管道对接焊工艺',
            status: 'approved',
            priority: 'normal',
            base_material: 'Q235',
            welding_process: 'SMAW',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            user_id: user?.id || '',
            view_count: 25,
            download_count: 5,
          } as WPSRecord,
          {
            id: '2',
            wps_number: 'WPS-2024-002',
            title: '不锈钢容器角焊缝工艺',
            status: 'review',
            priority: 'high',
            base_material: '304',
            welding_process: 'GTAW',
            created_at: '2024-01-14T15:20:00Z',
            updated_at: '2024-01-15T09:10:00Z',
            user_id: user?.id || '',
            view_count: 18,
            download_count: 2,
          } as WPSRecord,
        ]

        const mockRecentPQR: PQRRecord[] = [
          {
            id: '1',
            pqr_number: 'PQR-2024-001',
            title: '管道对接焊工艺评定',
            status: 'qualified',
            test_date: '2024-01-10',
            base_material: 'Q235',
            welding_process: 'SMAW',
            created_at: '2024-01-10T16:45:00Z',
            updated_at: '2024-01-10T16:45:00Z',
            user_id: user?.id || '',
          } as PQRRecord,
          {
            id: '2',
            pqr_number: 'PQR-2024-002',
            title: '不锈钢角焊缝工艺评定',
            status: 'pending',
            test_date: '2024-01-12',
            base_material: '304',
            welding_process: 'GTAW',
            created_at: '2024-01-12T14:30:00Z',
            updated_at: '2024-01-12T14:30:00Z',
            user_id: user?.id || '',
          } as PQRRecord,
        ]

        setStats(mockStats)
        setRecentWPS(mockRecentWPS)
        setRecentPQR(mockRecentPQR)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'default',
      review: 'processing',
      approved: 'success',
      rejected: 'error',
      archived: 'default',
      pending: 'warning',
      qualified: 'success',
      failed: 'error',
    }
    return colorMap[status] || 'default'
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      approved: '已批准',
      rejected: '已拒绝',
      archived: '已归档',
      pending: '待处理',
      qualified: '合格',
      failed: '不合格',
    }
    return textMap[status] || status
  }

  // 获取会员等级显示名称
  const getMembershipTierName = (tier: string) => {
    const tierNames: Record<string, string> = {
      personal_free: '个人免费版',
      personal_pro: '个人专业版',
      personal_advanced: '个人高级版',
      personal_flagship: '个人旗舰版',
      enterprise: '企业版',
      enterprise_pro: '企业版PRO',
      enterprise_pro_max: '企业版PRO MAX',
      // 兼容旧的等级名称
      free: '个人免费版',
    }
    return tierNames[tier] || '未知'
  }

  // 获取会员等级配额
  const getMembershipQuotas = (tier: string) => {
    const quotaMap: Record<string, any> = {
      personal_free: {
        wps: 10,
        pqr: 10,
        ppqr: 0,
        materials: 0,
        welders: 0,
        equipment: 0,
        storage: 100,
      },
      personal_pro: {
        wps: 30,
        pqr: 30,
        ppqr: 30,
        materials: 50,
        welders: 20,
        equipment: 0,
        storage: 500,
      },
      personal_advanced: {
        wps: 50,
        pqr: 50,
        ppqr: 50,
        materials: 100,
        welders: 50,
        equipment: 20,
        storage: 1000,
      },
      personal_flagship: {
        wps: 100,
        pqr: 100,
        ppqr: 100,
        materials: 200,
        welders: 100,
        equipment: 50,
        storage: 2000,
      },
      enterprise: {
        wps: 200,
        pqr: 200,
        ppqr: 200,
        materials: 500,
        welders: 200,
        equipment: 100,
        storage: 5000,
      },
      enterprise_pro: {
        wps: 400,
        pqr: 400,
        ppqr: 400,
        materials: 1000,
        welders: 400,
        equipment: 200,
        storage: 10000,
      },
      enterprise_pro_max: {
        wps: 500,
        pqr: 500,
        ppqr: 500,
        materials: 2000,
        welders: 500,
        equipment: 500,
        storage: 20000,
      },
      // 兼容旧的等级名称
      free: {
        wps: 10,
        pqr: 10,
        ppqr: 0,
        materials: 0,
        welders: 0,
        equipment: 0,
        storage: 100,
      },
    }
    return quotaMap[tier] || quotaMap.personal_free
  }

  // WPS表格列配置
  const wpsColumns = [
    {
      title: 'WPS编号',
      dataIndex: 'wps_number',
      key: 'wps_number',
      render: (text: string, record: WPSRecord) => (
        <Button type="link" onClick={() => navigate(`/wps/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: WPSRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/wps/${record.id}`)}
            />
          </Tooltip>
          {!isGuestMode && checkPermission('wps.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/wps/${record.id}/edit`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // PQR表格列配置
  const pqrColumns = [
    {
      title: 'PQR编号',
      dataIndex: 'pqr_number',
      key: 'pqr_number',
      render: (text: string, record: PQRRecord) => (
        <Button type="link" onClick={() => navigate(`/pqr/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '测试日期',
      dataIndex: 'test_date',
      key: 'test_date',
      render: (date: string) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: PQRRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/pqr/${record.id}`)}
            />
          </Tooltip>
          {!isGuestMode && checkPermission('pqr.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/pqr/${record.id}/edit`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="dashboard-container">
      {/* 顶部欢迎区域 */}
      <div className="dashboard-welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <Title level={1} className="welcome-title">
              {isGuestMode ? '欢迎体验焊接工艺管理系统' : `欢迎回来，${user?.full_name || user?.username}！`}
            </Title>
            <Paragraph className="welcome-subtitle">
              今天是 {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Paragraph>
            <Paragraph className="welcome-description">
              {isGuestMode
                ? '这是焊接工艺管理系统的演示模式，您可以浏览基础功能，了解系统的主要特性。注册后可使用完整功能。'
                : '这是您的焊接工艺管理系统概览，高效管理您的焊接工艺、资质评定和焊工信息。'
              }
            </Paragraph>
          </div>
          <div className="welcome-stats">
            <div className="stat-item">
              <div className="stat-number">{stats?.wps_count || 0}</div>
              <div className="stat-label">WPS记录</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats?.pqr_count || 0}</div>
              <div className="stat-label">PQR记录</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats?.welders_count || 0}</div>
              <div className="stat-label">认证焊工</div>
            </div>
          </div>
        </div>
      </div>

      {/* 会员状态卡片 */}
      <div className="dashboard-user-info">
        {isGuestMode ? (
          <Card className="membership-card">
            <div className="membership-content">
              <div className="membership-info">
                <div className="membership-header">
                  <CrownOutlined className="membership-icon" />
                  <div>
                    <div className="membership-tier">游客体验模式</div>
                    <div className="membership-user">访客用户</div>
                  </div>
                </div>
                <div className="membership-upgrade">
                  <Text type="secondary">注册后解锁完整功能</Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CrownOutlined />}
                    onClick={() => navigate('/login')}
                  >
                    立即注册
                  </Button>
                </div>
              </div>
              <div className="storage-info">
                <div className="storage-header">
                  <DatabaseOutlined />
                  <Text>演示数据</Text>
                </div>
                <Text type="secondary" className="storage-text">
                  当前为演示模式，显示模拟数据
                </Text>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="membership-card">
            <div className="membership-content">
              <div className="membership-info">
                <div className="membership-header">
                  <CrownOutlined className="membership-icon" />
                  <div>
                    <div className="membership-tier">
                      {getMembershipTierName((user as any)?.member_tier || user?.membership_tier || 'personal_free')}
                    </div>
                    <div className="membership-user">
                      {user?.full_name || user?.username}
                    </div>
                  </div>
                </div>
                {(() => {
                const tier = (user as any)?.member_tier || user?.membership_tier || 'personal_free'
                return tier === 'free' || tier === 'personal_free'
              })() && (
                  <div className="membership-upgrade">
                    <Text type="secondary">升级解锁更多功能</Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CrownOutlined />}
                      onClick={() => navigate('/membership/upgrade')}
                    >
                      立即升级
                    </Button>
                  </div>
                )}
              </div>
              <div className="storage-info">
                <div className="storage-header">
                  <DatabaseOutlined />
                  <Text>存储空间</Text>
                </div>
                <Progress
                  percent={(stats?.storage_used_mb || 0) / (stats?.storage_limit_mb || 500) * 100}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  className="storage-progress"
                />
                <Text type="secondary" className="storage-text">
                  {stats?.storage_used_mb || 0}MB / {stats?.storage_limit_mb || 500}MB
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* 快速操作卡片 */}
        <Card className="quick-actions-card">
          <div className="quick-actions-header">
            <SettingOutlined />
            <Text strong>快速操作</Text>
          </div>
          <div className="quick-actions-grid">
            {(isGuestMode || checkPermission('wps.create')) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/wps/create')}
                disabled={!isGuestMode && !canCreateMore('wps', stats?.wps_count || 0)}
                className="quick-action-btn"
              >
                创建WPS
              </Button>
            )}
            {(isGuestMode || checkPermission('pqr.create')) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/pqr/create')}
                disabled={!isGuestMode && !canCreateMore('pqr', stats?.pqr_count || 0)}
                className="quick-action-btn"
              >
                创建PQR
              </Button>
            )}
            <Button
              icon={<BarChartOutlined />}
              onClick={() => navigate('/reports')}
              className="quick-action-btn"
            >
              查看报表
            </Button>
            {isGuestMode ? (
              <Button
                icon={<CrownOutlined />}
                onClick={() => navigate('/login')}
                className="quick-action-btn"
                type="primary"
              >
                立即注册
              </Button>
            ) : (
              <Button
                icon={<CrownOutlined />}
                onClick={() => navigate('/membership')}
                className="quick-action-btn"
              >
                会员中心
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 数据概览卡片 */}
      <div className="data-overview-section">
        <Row gutter={[16, 16]}>
          {(() => {
            const tier = (user as any)?.member_tier || user?.membership_tier || 'personal_free'
            const quotas = getMembershipQuotas(tier)
            return (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Card className="overview-card wps-card">
                    <div className="overview-content">
                      <div className="overview-icon">
                        <FileTextOutlined />
                      </div>
                      <div className="overview-info">
                        <div className="overview-title">WPS记录</div>
                        <div className="overview-number">{stats?.wps_count || 0}</div>
                        <div className="overview-progress">
                          <Progress
                            percent={quotas.wps > 0 ? ((stats?.membership_usage.wps_usage || 0) / quotas.wps) * 100 : 0}
                            size="small"
                            showInfo={false}
                            strokeColor="#1890ff"
                            status={quotas.wps > 0 && ((stats?.membership_usage.wps_usage || 0) / quotas.wps) >= 0.8 ? 'exception' : 'normal'}
                          />
                          <Text type="secondary" className="progress-text">
                            {quotas.wps > 0 ? `${stats?.membership_usage.wps_usage || 0}/${quotas.wps}` : '未开通'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="overview-card pqr-card">
                    <div className="overview-content">
                      <div className="overview-icon">
                        <ExperimentOutlined />
                      </div>
                      <div className="overview-info">
                        <div className="overview-title">PQR记录</div>
                        <div className="overview-number">{stats?.pqr_count || 0}</div>
                        <div className="overview-progress">
                          <Progress
                            percent={quotas.pqr > 0 ? ((stats?.membership_usage.pqr_usage || 0) / quotas.pqr) * 100 : 0}
                            size="small"
                            showInfo={false}
                            strokeColor="#52c41a"
                            status={quotas.pqr > 0 && ((stats?.membership_usage.pqr_usage || 0) / quotas.pqr) >= 0.8 ? 'exception' : 'normal'}
                          />
                          <Text type="secondary" className="progress-text">
                            {quotas.pqr > 0 ? `${stats?.membership_usage.pqr_usage || 0}/${quotas.pqr}` : '未开通'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="overview-card ppqr-card">
                    <div className="overview-content">
                      <div className="overview-icon">
                        <SettingOutlined />
                      </div>
                      <div className="overview-info">
                        <div className="overview-title">pPQR记录</div>
                        <div className="overview-number">{stats?.ppqr_count || 0}</div>
                        <div className="overview-progress">
                          <Progress
                            percent={quotas.ppqr > 0 ? ((stats?.membership_usage.ppqr_usage || 0) / quotas.ppqr) * 100 : 0}
                            size="small"
                            showInfo={false}
                            strokeColor="#722ed1"
                            status={quotas.ppqr > 0 && ((stats?.membership_usage.ppqr_usage || 0) / quotas.ppqr) >= 0.8 ? 'exception' : 'normal'}
                          />
                          <Text type="secondary" className="progress-text">
                            {quotas.ppqr > 0 ? `${stats?.membership_usage.ppqr_usage || 0}/${quotas.ppqr}` : '未开通'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="overview-card welders-card">
                    <div className="overview-content">
                      <div className="overview-icon">
                        <TeamOutlined />
                      </div>
                      <div className="overview-info">
                        <div className="overview-title">认证焊工</div>
                        <div className="overview-number">{stats?.welders_count || 0}</div>
                        <div className="overview-progress">
                          <Progress
                            percent={quotas.welders > 0 ? ((stats?.membership_usage.welders_usage || 0) / quotas.welders) * 100 : 0}
                            size="small"
                            showInfo={false}
                            strokeColor="#fa8c16"
                            status={quotas.welders > 0 && ((stats?.membership_usage.welders_usage || 0) / quotas.welders) >= 0.8 ? 'exception' : 'normal'}
                          />
                          <Text type="secondary" className="progress-text">
                            {quotas.welders > 0 ? `${stats?.membership_usage.welders_usage || 0}/${quotas.welders}` : '未开通'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </>
            )
          })()}
        </Row>
      </div>

      {/* 最近记录 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="最近WPS记录"
            extra={
              <Button type="link" onClick={() => navigate('/wps')}>
                查看全部
              </Button>
            }
          >
            <Table
              dataSource={recentWPS}
              columns={wpsColumns}
              pagination={false}
              size="small"
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="最近PQR记录"
            extra={
              <Button type="link" onClick={() => navigate('/pqr')}>
                查看全部
              </Button>
            }
          >
            <Table
              dataSource={recentPQR}
              columns={pqrColumns}
              pagination={false}
              size="small"
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard