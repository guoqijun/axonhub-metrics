import client from './client'
import type { FilterState } from '../hooks/useFilters'

function toParams(filters: FilterState): Record<string, any> {
  const params: Record<string, any> = {
    start_date: filters.dateRange[0].format('YYYY-MM-DD'),
    end_date: filters.dateRange[1].format('YYYY-MM-DD'),
    granularity: filters.granularity,
  }
  if (filters.userIds.length) params.user_ids = filters.userIds.join(',')
  if (filters.channelIds.length) params.channel_ids = filters.channelIds.join(',')
  if (filters.modelIds.length) params.model_ids = filters.modelIds.join(',')
  return params
}

export interface OverviewKPI {
  today_requests: number
  dau: number
  success_rate: number
  today_cost: number
  total_requests_30d: number
  avg_latency_ms: number
}

export interface TrendPoint {
  date: string
  value: number
}

export interface TokenTrendPoint {
  date: string
  prompt_tokens: number
  completion_tokens: number
}

export interface ModelDistItem {
  model_id: string
  request_count: number
  percentage: number
}

export interface ErrorTrendPoint {
  date: string
  error_rate: number
  error_count: number
  total_count: number
}

export async function fetchOverviewKPI(filters: FilterState): Promise<OverviewKPI> {
  const { data } = await client.get('/overview/kpi', { params: toParams(filters) })
  return data
}

export async function fetchRequestsTrend(filters: FilterState): Promise<TrendPoint[]> {
  const { data } = await client.get('/overview/requests_trend', { params: toParams(filters) })
  return data
}

export async function fetchTokenTrend(filters: FilterState): Promise<TokenTrendPoint[]> {
  const { data } = await client.get('/overview/token_trend', { params: toParams(filters) })
  return data
}

export async function fetchModelDistribution(filters: FilterState): Promise<ModelDistItem[]> {
  const { data } = await client.get('/overview/model_distribution', { params: toParams(filters) })
  return data
}

export async function fetchErrorTrend(filters: FilterState): Promise<ErrorTrendPoint[]> {
  const { data } = await client.get('/overview/error_trend', { params: toParams(filters) })
  return data
}

// ---- Adoption (推广覆盖度) ----

export interface DAUMauPoint {
  date: string
  dau: number
  mau: number
}

export interface UsageRatio {
  active_users: number
  total_users: number
  ratio: number
}

export interface ChannelActiveUsers {
  channel_id: number | null
  channel_name: string | null
  active_users: number
}

export interface ModelUserCount {
  model_id: string
  user_count: number
}

export interface ActivityHeatmapPoint {
  day_of_week: number
  hour: number
  user_count: number
}

export interface ProjectRanking {
  project_id: number | null
  project_name: string | null
  request_count: number
  user_count: number
}

export async function fetchDAUMauTrend(filters: FilterState): Promise<DAUMauPoint[]> {
  const { data } = await client.get('/adoption/dau_mau_trend', { params: toParams(filters) })
  return data
}

export async function fetchUsageRatio(filters: FilterState): Promise<UsageRatio> {
  const { data } = await client.get('/adoption/usage_ratio', { params: toParams(filters) })
  return data
}

export async function fetchNewUserTrend(filters: FilterState): Promise<TrendPoint[]> {
  const { data } = await client.get('/adoption/new_user_trend', { params: toParams(filters) })
  return data
}

export async function fetchChannelActiveUsers(filters: FilterState): Promise<ChannelActiveUsers[]> {
  const { data } = await client.get('/adoption/channel_active_users', { params: toParams(filters) })
  return data
}

export async function fetchModelUserCount(filters: FilterState): Promise<ModelUserCount[]> {
  const { data } = await client.get('/adoption/model_user_count', { params: toParams(filters) })
  return data
}

export async function fetchActivityHeatmap(filters: FilterState): Promise<ActivityHeatmapPoint[]> {
  const { data } = await client.get('/adoption/activity_heatmap', { params: toParams(filters) })
  return data
}

export async function fetchProjectRanking(filters: FilterState): Promise<ProjectRanking[]> {
  const { data } = await client.get('/adoption/project_ranking', { params: toParams(filters) })
  return data
}

// ---- Usage (深度使用) ----

export interface AvgConversationRounds {
  avg_rounds: number
  total_conversations: number
}

export interface AvgTokensPerRequest {
  avg_tokens: number
  avg_prompt: number
  avg_completion: number
}

export interface SessionDurationBucket {
  bucket: string
  count: number
}

export interface FrequencyBucket {
  bucket: string
  user_count: number
}

export interface ChannelDailyRequests {
  channel_id: number | null
  channel_name: string | null
  daily_avg: number
}

export interface StreamRatio {
  stream_count: number
  total_count: number
  stream_ratio: number
}

export interface RetentionCohortPoint {
  cohort: string
  active_month: string
  active_users: number
}

export interface DailyPerCapita {
  date: string
  total_requests: number
  active_users: number
  per_capita: number
}

export async function fetchAvgConversationRounds(filters: FilterState): Promise<AvgConversationRounds> {
  const { data } = await client.get('/usage/avg_conversation_rounds', { params: toParams(filters) })
  return data
}

export async function fetchAvgTokensPerRequest(filters: FilterState): Promise<AvgTokensPerRequest> {
  const { data } = await client.get('/usage/avg_tokens_per_request', { params: toParams(filters) })
  return data
}

export async function fetchSessionDuration(filters: FilterState): Promise<SessionDurationBucket[]> {
  const { data } = await client.get('/usage/session_duration', { params: toParams(filters) })
  return data
}

export async function fetchRequestFrequencyBuckets(filters: FilterState): Promise<FrequencyBucket[]> {
  const { data } = await client.get('/usage/request_frequency_buckets', { params: toParams(filters) })
  return data
}

export async function fetchChannelDailyRequests(filters: FilterState): Promise<ChannelDailyRequests[]> {
  const { data } = await client.get('/usage/channel_daily_requests', { params: toParams(filters) })
  return data
}

export async function fetchStreamRatio(filters: FilterState): Promise<StreamRatio> {
  const { data } = await client.get('/usage/stream_ratio', { params: toParams(filters) })
  return data
}

export async function fetchUserRetentionCohort(filters: FilterState): Promise<RetentionCohortPoint[]> {
  const { data } = await client.get('/usage/user_retention_cohort', { params: toParams(filters) })
  return data
}

export async function fetchDailyPerCapita(filters: FilterState): Promise<DailyPerCapita[]> {
  const { data } = await client.get('/usage/daily_per_capita', { params: toParams(filters) })
  return data
}

// ---- Value (产出与价值) ----

export interface HeavyUser {
  user_id: number | null
  email: string | null
  name: string
  request_count: number
  total_tokens: number
  total_cost: number
}

export interface TokenRanking {
  model_id: string
  total_prompt: number
  total_completion: number
  total_tokens: number
}

export interface RFMQuadrant {
  quadrant: string
  user_count: number
}

export interface ChannelEfficiency {
  channel_id: number | null
  channel_name: string | null
  request_count: number
  total_tokens: number
  total_cost: number
  tokens_per_dollar: number
}

export interface ProjectContributionPoint {
  date: string
  project_id: number | null
  project_name: string | null
  request_count: number
  total_tokens: number
}

export interface ModelOutputRanking {
  model_id: string
  request_count: number
  total_tokens: number
  completion_tokens: number
  avg_completion_per_request: number
}

export async function fetchHeavyUsers(filters: FilterState): Promise<HeavyUser[]> {
  const { data } = await client.get('/value/heavy_users', { params: toParams(filters) })
  return data
}

export async function fetchTokenRanking(filters: FilterState): Promise<TokenRanking[]> {
  const { data } = await client.get('/value/token_ranking', { params: toParams(filters) })
  return data
}

export async function fetchRFMMatrix(filters: FilterState): Promise<RFMQuadrant[]> {
  const { data } = await client.get('/value/rfm_matrix', { params: toParams(filters) })
  return data
}

export async function fetchChannelEfficiency(filters: FilterState): Promise<ChannelEfficiency[]> {
  const { data } = await client.get('/value/channel_efficiency', { params: toParams(filters) })
  return data
}

export async function fetchProjectContribution(filters: FilterState): Promise<ProjectContributionPoint[]> {
  const { data } = await client.get('/value/project_contribution', { params: toParams(filters) })
  return data
}

export async function fetchModelOutputRanking(filters: FilterState): Promise<ModelOutputRanking[]> {
  const { data } = await client.get('/value/model_output_ranking', { params: toParams(filters) })
  return data
}

// ---- Cost (成本分析) ----

export interface TokenFeeTrendPoint {
  date: string
  prompt_tokens: number
  completion_tokens: number
  total_cost: number
}

export interface CostModelDist {
  model_id: string
  total_cost: number
  request_count: number
  total_tokens: number
}

export interface ChannelCostComparison {
  channel_id: number | null
  channel_name: string | null
  total_cost: number
  request_count: number
  avg_cost_per_request: number
}

export interface CostTopUser {
  user_id: number | null
  email: string | null
  name: string
  total_cost: number
  request_count: number
  total_tokens: number
}

export interface ProjectDailyCost {
  date: string
  project_id: number | null
  project_name: string | null
  total_cost: number
}

export interface CacheHitRatePoint {
  date: string
  prompt_tokens: number
  cached_tokens: number
  cache_hit_pct: number
}

export interface ReasoningRatioPoint {
  date: string
  completion_tokens: number
  reasoning_tokens: number
  reasoning_pct: number
}

export interface ForecastPoint {
  date: string
  actual: number | null
  forecast: number | null
}

export async function fetchTokenFeeTrend(filters: FilterState): Promise<TokenFeeTrendPoint[]> {
  const { data } = await client.get('/cost/token_fee_trend', { params: toParams(filters) })
  return data
}

export async function fetchCostModelDistribution(filters: FilterState): Promise<CostModelDist[]> {
  const { data } = await client.get('/cost/model_distribution', { params: toParams(filters) })
  return data
}

export async function fetchChannelComparison(filters: FilterState): Promise<ChannelCostComparison[]> {
  const { data } = await client.get('/cost/channel_comparison', { params: toParams(filters) })
  return data
}

export async function fetchCostUserTop(filters: FilterState): Promise<CostTopUser[]> {
  const { data } = await client.get('/cost/user_top', { params: toParams(filters) })
  return data
}

export async function fetchProjectDailyCost(filters: FilterState): Promise<ProjectDailyCost[]> {
  const { data } = await client.get('/cost/project_daily_cost', { params: toParams(filters) })
  return data
}

export async function fetchCacheHitRate(filters: FilterState): Promise<CacheHitRatePoint[]> {
  const { data } = await client.get('/cost/cache_hit_rate', { params: toParams(filters) })
  return data
}

export async function fetchReasoningRatio(filters: FilterState): Promise<ReasoningRatioPoint[]> {
  const { data } = await client.get('/cost/reasoning_ratio', { params: toParams(filters) })
  return data
}

export async function fetchForecast(filters: FilterState): Promise<ForecastPoint[]> {
  const { data } = await client.get('/cost/forecast', { params: toParams(filters) })
  return data
}

// ---- Errors (错误分析) ----

export interface ErrorRatePoint {
  date: string
  total_count: number
  error_count: number
  error_rate: number
}

export interface ErrorTypeDist {
  status: string
  count: number
}

export interface ErrorByModel {
  model_id: string
  total_count: number
  error_count: number
  error_rate: number
}

export interface ErrorByChannel {
  channel_id: number | null
  channel_name: string | null
  total_count: number
  error_count: number
  error_rate: number
}

export interface ErrorHeatmapPoint {
  day_of_week: number
  hour: number
  error_count: number
}

export interface TopFailingUser {
  user_id: number | null
  email: string | null
  name: string
  total_count: number
  error_count: number
  error_rate: number
}

export interface ChannelErrorMatrixPoint {
  channel_id: number | null
  channel_name: string | null
  status: string | null
  count: number
}

export interface RetrySuccessCategory {
  category: string
  trace_count: number
}

export interface StatusCodeDist {
  status: string
  count: number
}

export async function fetchErrorRateTrend(filters: FilterState): Promise<ErrorRatePoint[]> {
  const { data } = await client.get('/errors/rate_trend', { params: toParams(filters) })
  return data
}

export async function fetchErrorTypeDistribution(filters: FilterState): Promise<ErrorTypeDist[]> {
  const { data } = await client.get('/errors/type_distribution', { params: toParams(filters) })
  return data
}

export async function fetchErrorByModel(filters: FilterState): Promise<ErrorByModel[]> {
  const { data } = await client.get('/errors/by_model', { params: toParams(filters) })
  return data
}

export async function fetchErrorByChannel(filters: FilterState): Promise<ErrorByChannel[]> {
  const { data } = await client.get('/errors/by_channel', { params: toParams(filters) })
  return data
}

export async function fetchErrorHeatmap(filters: FilterState): Promise<ErrorHeatmapPoint[]> {
  const { data } = await client.get('/errors/heatmap', { params: toParams(filters) })
  return data
}

export async function fetchTopFailingUsers(filters: FilterState): Promise<TopFailingUser[]> {
  const { data } = await client.get('/errors/top_failing_users', { params: toParams(filters) })
  return data
}

export async function fetchChannelErrorMatrix(filters: FilterState): Promise<ChannelErrorMatrixPoint[]> {
  const { data } = await client.get('/errors/channel_error_matrix', { params: toParams(filters) })
  return data
}

export async function fetchRetrySuccessRate(filters: FilterState): Promise<RetrySuccessCategory[]> {
  const { data } = await client.get('/errors/retry_success_rate', { params: toParams(filters) })
  return data
}

export async function fetchStatusCodeDistribution(filters: FilterState): Promise<StatusCodeDist[]> {
  const { data } = await client.get('/errors/status_code_distribution', { params: toParams(filters) })
  return data
}

// ---- Channels (多渠道对比) ----

export interface ChannelComparison {
  channel_id: number | null
  channel_name: string | null
  channel_type: string | null
  request_count: number
  user_count: number
  avg_latency: number
  total_cost: number
  total_tokens: number
  error_count: number
  error_rate: number
  model_count: number
}

export interface ChannelLatency {
  channel_id: number | null
  channel_name: string | null
  avg_latency: number
  max_latency: number
}

export interface ChannelLatencyHeatmapPoint {
  channel_id: number | null
  channel_name: string | null
  hour: number
  avg_latency: number
}

export interface ChannelHealth {
  channel_id: number | null
  channel_name: string | null
  total_requests: number
  error_count: number
  error_rate: number
  avg_latency: number
  health_score: number
}

export interface ChannelErrorTrendPoint {
  date: string
  channel_id: number | null
  channel_name: string | null
  total_count: number
  error_count: number
  error_rate: number
}

export interface QuotaStatus {
  channel_id: number
  channel_name: string | null
  provider_type: string | null
  status: string
  ready: boolean
  next_reset_at: string | null
  next_check_at: string | null
}

export interface ChannelPricePoint {
  channel_id: number | null
  channel_name: string | null
  model_id: string
  avg_cost_per_token: number
  request_count: number
}

export async function fetchChannelComparisonTable(filters: FilterState): Promise<ChannelComparison[]> {
  const { data } = await client.get('/channels/comparison_table', { params: toParams(filters) })
  return data
}

export async function fetchChannelLatencyComparison(filters: FilterState): Promise<ChannelLatency[]> {
  const { data } = await client.get('/channels/latency_comparison', { params: toParams(filters) })
  return data
}

export async function fetchChannelLatencyHeatmap(filters: FilterState): Promise<ChannelLatencyHeatmapPoint[]> {
  const { data } = await client.get('/channels/latency_heatmap', { params: toParams(filters) })
  return data
}

export async function fetchChannelHealthScores(filters: FilterState): Promise<ChannelHealth[]> {
  const { data } = await client.get('/channels/health_scores', { params: toParams(filters) })
  return data
}

export async function fetchChannelErrorTrendOverlay(filters: FilterState): Promise<ChannelErrorTrendPoint[]> {
  const { data } = await client.get('/channels/error_trend_overlay', { params: toParams(filters) })
  return data
}

export async function fetchChannelQuotaStatus(filters: FilterState): Promise<QuotaStatus[]> {
  const { data } = await client.get('/channels/quota_status', { params: toParams(filters) })
  return data
}

export async function fetchChannelPriceComparison(filters: FilterState): Promise<ChannelPricePoint[]> {
  const { data } = await client.get('/channels/price_comparison', { params: toParams(filters) })
  return data
}

// ---- Health (系统健康度) ----

export interface LatencyTrendPoint {
  date: string
  p50_latency: number
  p95_latency: number
  p99_latency: number
}

export interface ChannelHealthRanking {
  channel_id: number | null
  channel_name: string | null
  total_requests: number
  success_rate: number
  avg_latency: number
  health_score: number
}

export interface SlowRequest {
  request_id: number
  model_id: string
  channel_name: string | null
  latency_ms: number
  status: string
  created_at: string
}

export interface QuotaAlert {
  channel_id: number
  channel_name: string | null
  provider_type: string | null
  status: string
  ready: boolean
  next_reset_at: string | null
}

export interface ProbeTrendPoint {
  date: string
  channel_id: number | null
  channel_name: string | null
  avg_tokens_per_second: number
  avg_time_to_first_token_ms: number
  request_count: number
}

export interface CacheHitTrendPoint {
  date: string
  prompt_tokens: number
  cached_tokens: number
  cache_hit_pct: number
}

export interface AvailabilityCalendarPoint {
  date: string
  total_requests: number
  success_count: number
  availability_pct: number
}

export async function fetchLatencyTrend(filters: FilterState): Promise<LatencyTrendPoint[]> {
  const { data } = await client.get('/health/latency_trend', { params: toParams(filters) })
  return data
}

export async function fetchChannelHealthRanking(filters: FilterState): Promise<ChannelHealthRanking[]> {
  const { data } = await client.get('/health/channel_health_ranking', { params: toParams(filters) })
  return data
}

export async function fetchSlowRequests(filters: FilterState): Promise<SlowRequest[]> {
  const { data } = await client.get('/health/slow_requests', { params: toParams(filters) })
  return data
}

export async function fetchQuotaAlertList(filters: FilterState): Promise<QuotaAlert[]> {
  const { data } = await client.get('/health/quota_alert_list', { params: toParams(filters) })
  return data
}

export async function fetchProbeTrend(filters: FilterState): Promise<ProbeTrendPoint[]> {
  const { data } = await client.get('/health/probe_trend', { params: toParams(filters) })
  return data
}

export async function fetchCacheHitTrend(filters: FilterState): Promise<CacheHitTrendPoint[]> {
  const { data } = await client.get('/health/cache_hit_trend', { params: toParams(filters) })
  return data
}

export async function fetchAvailabilityCalendar(filters: FilterState): Promise<AvailabilityCalendarPoint[]> {
  const { data } = await client.get('/health/availability_calendar', { params: toParams(filters) })
  return data
}

// ---- Growth (增长趋势) ----

export interface MomYoyPoint {
  month: string
  request_count: number
  request_growth_pct: number
  user_count: number
  user_growth_pct: number
  total_tokens: number
  token_growth_pct: number
  total_cost: number
  cost_growth_pct: number
}

export interface GrowthForecastPoint {
  date: string
  metric: string
  actual: number | null
  forecast: number | null
}

export interface UserGrowthPoint {
  date: string
  new_users: number
  cumulative_users: number
}

export interface ModelGrowthRate {
  model_id: string
  month: string
  request_count: number
}

export interface ChannelMarketShare {
  month: string
  channel_id: number | null
  channel_name: string | null
  request_count: number
  share_pct: number
}

export interface ProjectGrowthRanking {
  project_id: number | null
  project_name: string | null
  request_count: number
  user_count: number
}

export async function fetchMomYoy(filters: FilterState): Promise<MomYoyPoint[]> {
  const { data } = await client.get('/growth/mom_yoy', { params: toParams(filters) })
  return data
}

export async function fetchGrowthForecast(filters: FilterState): Promise<GrowthForecastPoint[]> {
  const { data } = await client.get('/growth/forecast', { params: toParams(filters) })
  return data
}

export async function fetchUserGrowthCurve(filters: FilterState): Promise<UserGrowthPoint[]> {
  const { data } = await client.get('/growth/user_growth_curve', { params: toParams(filters) })
  return data
}

export async function fetchModelGrowthRate(filters: FilterState): Promise<ModelGrowthRate[]> {
  const { data } = await client.get('/growth/model_growth_rate', { params: toParams(filters) })
  return data
}

export async function fetchChannelMarketShare(filters: FilterState): Promise<ChannelMarketShare[]> {
  const { data } = await client.get('/growth/channel_market_share', { params: toParams(filters) })
  return data
}

export async function fetchProjectGrowthRanking(filters: FilterState): Promise<ProjectGrowthRanking[]> {
  const { data } = await client.get('/growth/project_growth_ranking', { params: toParams(filters) })
  return data
}
