import {Paging} from "@/utils/yakQueryHTTPFlow"
import {QueryGeneralResponse} from "@/pages/invoker/schema"
import {ReactNode} from "react"
import {TableVirtualResizeProps} from "@/components/TableVirtualResize/TableVirtualResizeType"
import {CodeRangeProps} from "@/pages/yakRunnerAuditCode/RightAuditDetail/RightAuditDetail"

export interface SSARisk {
    Id: number
    CreatedAt: number
    UpdatedAt?: number

    Hash: string

    ProgramName: string
    CodeSourceUrl: string
    CodeRange: string
    CodeFragment: string

    Title: string
    TitleVerbose?: string
    RiskType: string
    RiskTypeVerbose?: string
    Details?: string
    Severity?: string

    FromRule: string
    RuntimeID: string

    IsPotential: boolean

    CVE: string
    CveAccessVector: string
    CveAccessComplexity: string
    Tags: string
    ResultID: number

    IsRead: boolean

    // 前端用于染色 后端不存在此字段
    cellClassName?: string
}

export interface YakitAuditHoleTableProps {
    setRiskLoading: (b: boolean) => void
    /**是否开启高级查询 */
    advancedQuery?: boolean
    setAdvancedQuery?: (b: boolean) => void
    query: QuerySSARisksRequest
    setQuery: (v: QuerySSARisksRequest) => void
    renderTitle?: ReactNode
    riskWrapperClassName?: string
    tableVirtualResizeProps?: TableVirtualResizeProps
    yakitRiskDetailsBorder?: boolean
    excludeColumnsKey?: string[]
    /**该字段会影响初次请求数据，建议外界只使用，不设值 */
    allTotal?: number
    setAllTotal?: (b: number) => void
}

export interface YakitRiskDetailsProps {
    className?: string
    info: SSARisk
    isShowTime?: boolean
    shrink?: ConstrainBoolean
    onClickIP?: (info: SSARisk) => void
    border?: boolean
    isShowExtra?: boolean
    onRetest?: (info: SSARisk) => void
}

export interface YakitRiskSelectTagProps {
    info: SSARisk
    onClose?: () => void
    onSave: (info: SSARisk) => void
}

export interface YakitCodeScanRiskDetailsProps {
    className?: string
    info: SSARisk
    onClickIP?: (info: SSARisk) => void
    border?: boolean
    isShowExtra?: boolean
}

export interface YakURLDataItemProps {
    index: string
    code_range: CodeRangeProps
    source: string
    ResourceName: string
}

export interface QuerySSARisksRequest {
    Pagination: Paging
    Filter: SSARisksFilter
}

export type QuerySSARisksResponse = QueryGeneralResponse<SSARisk>

export interface SSARisksFilter {
    ID?: number[]
    Search?: string
    ProgramName?: string[]
    CodeSourceUrl?: string[]
    RiskType?: string[]
    Severity?: string[]
    FromRule?: string[]
    RuntimeID?: string[]
    ResultID?: string[]
    Tags?: string[]

    // 此处需等待后端写入
    /** 全部'' 已读:'true'，未读：'false' */
    IsRead?: string
}

export interface DeleteSSARisksRequest {
    Filter?: SSARisksFilter
}
