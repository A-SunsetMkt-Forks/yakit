import React, {useEffect, useState} from "react"
import {
    Button,
    Col,
    Empty,
    Form,
    Input,
    PageHeader,
    Pagination,
    Popconfirm,
    Row,
    Select,
    Space,
    Switch,
    Tag,
    Popover
} from "antd"
import { YakQueryHTTPFlowRequest} from "../utils/yakQueryHTTPFlow"
import { showByCursorMenu } from "../utils/showByCursor"
import {showDrawer} from "../utils/showModal"
import {PaginationSchema} from "../pages/invoker/schema"
import {CheckOutlined, ReloadOutlined, SearchOutlined, CopyOutlined} from "@ant-design/icons"
import {
    InputItem,
    ManyMultiSelectForString,
    SwitchItem
} from "../utils/inputUtil"
import {HTTPFlowDetail, SendToFuzzerFunc} from "./HTTPFlowDetail"
import {failed, info, success} from "../utils/notification"
import "./style.css"
import Highlighter from "react-highlight-words"

import {CopyToClipboard} from "react-copy-to-clipboard"
import {TableResizableColumn} from "./TableResizableColumn"

const {ipcRenderer} = window.require("electron")

export interface HTTPHeaderItem {
    Header: string
    Value: string
}

export interface HTTPFlow {
    Id?: number
    Method: string
    Path: string
    Hash: string
    IsHTTPS: boolean
    Url: string
    Request: Uint8Array
    Response: Uint8Array
    StatusCode: number
    BodyLength: number
    BodySizeVerbose?: string
    ContentType: string
    SourceType: string
    RequestHeader: HTTPHeaderItem[]
    ResponseHeader: HTTPHeaderItem[]
    GetParamsTotal: number
    PostParamsTotal: number
    CookieParamsTotal: number
    CreatedAt: number
    UpdatedAt: number
    HostPort?: string
    IPAddress?: string
    HtmlTitle?: string

    GetParams: FuzzableParams[]
    PostParams: FuzzableParams[]
    CookieParams: FuzzableParams[]
}

export interface FuzzableParams {
    Position: string
    ParamName: string
    OriginValue: Uint8Array
    AutoTemplate: Uint8Array
    IsHTTPS: boolean
}

export interface TableFilterDropdownStringProp<T> {
    label: string
    pureBool?: boolean
    autoCompletions?: string[]
    pureString?: boolean
    filterName: string
    params?: T
    setParams?: (y: T) => any

    // from parentcotnext
    confirm?: any
    setSelectedKeys?: (keys: React.Key[]) => any
}

export interface TableFilterDropdownStringsProp<T> {
    label: string
    pureBool?: boolean
    autoCompletions?: string[]
    pureString?: boolean
    filterName: string
    params?: T
    setParams?: (y: T) => any
    submitFilter: () => any
}

export type FilterDropdownStringsProp = TableFilterDropdownStringsProp<YakQueryHTTPFlowRequest>

export type FilterDropdownStringProp = TableFilterDropdownStringProp<YakQueryHTTPFlowRequest>

export const TableFilterDropdownForm: React.FC<TableFilterDropdownStringProp<any>> = (
    props: TableFilterDropdownStringProp<any>
) => {
    return <HTTLFlowFilterDropdownForm {...props} />
}

export const HTTLFlowFilterDropdownForm: React.FC<FilterDropdownStringProp> = (props) => {
    const {params, setParams, setSelectedKeys} = props
    return (
        <div style={{padding: 8}}>
            <Form
                size={"small"}
                onSubmitCapture={(e) => {
                    e.preventDefault()

                    if (setSelectedKeys) {
                        // @ts-ignore
                        if (params[props.filterName]) {
                            setSelectedKeys([
                                `${props.filterName}: ${JSON.stringify(
                                    // @ts-ignore
                                    params ? {result: params[props.filterName]} : {}
                                )}`
                            ])
                        } else {
                            setSelectedKeys([])
                        }
                    }
                    if (props.confirm) {
                        props.confirm()
                    }
                }}
            >
                {props.pureBool ? (
                    <>
                        <SwitchItem
                            formItemStyle={{marginBottom: 4}}
                            label={props.label}
                            // @ts-ignore
                            value={params[props.filterName]}
                            setValue={(e) => {
                                if (params && setParams) {
                                    const newParams = {...params}
                                    // @ts-ignore
                                    newParams[props.filterName] = e
                                    setParams(newParams)
                                }
                            }}
                        />
                    </>
                ) : (
                    <>
                        {props.pureString ? (
                            <InputItem
                                style={{marginBottom: 4}}
                                label={props.label}
                                // @ts-ignore
                                value={params[props.filterName]}
                                setValue={(e) => {
                                    if (params && setParams) {
                                        const newParams = {...params}
                                        // @ts-ignore
                                        newParams[props.filterName] = e
                                        setParams(newParams)
                                    }
                                }}
                            />
                        ) : (
                            <ManyMultiSelectForString
                                mode={"tags"}
                                formItemStyle={{marginBottom: 4}}
                                label={props.label}
                                data={(props.autoCompletions || []).map((i) => {
                                    return {value: i, label: i}
                                })}
                                // @ts-ignore
                                value={params[props.filterName]}
                                setValue={(e) => {
                                    if (e === "") {
                                        if (setSelectedKeys) {
                                            setSelectedKeys([])
                                        }
                                    }
                                    if (params && setParams) {
                                        const newParams = {...params}
                                        // @ts-ignore
                                        newParams[props.filterName] = e
                                        setParams(newParams)
                                    }
                                }}
                            />
                        )}
                    </>
                )}
                <Form.Item style={{marginBottom: 0, marginTop: 0}} colon={false} label={" "}>
                    <Space>
                        <Button type='primary' htmlType='submit'>
                            {" "}
                            设置搜索条件{" "}
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedKeys && setSelectedKeys([])
                                if (params && setParams) {
                                    const newParams = {...params}
                                    // @ts-ignore
                                    newParams[props.filterName] = ""
                                    setParams(newParams)
                                }
                            }}
                        >
                            {" "}
                            重置搜索{" "}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
}

export const HTTLFlowFilterDropdownForms: React.FC<FilterDropdownStringsProp> = (props) => {
    const {params, setParams} = props

    return (
        <div style={{padding: 8}}>
            <Form
                size={"small"}
                onSubmitCapture={(e) => {
                    e.preventDefault()
                    props.submitFilter()
                }}
            >
                {props.pureBool ? (
                    <>
                        <SwitchItem
                            formItemStyle={{marginBottom: 4}}
                            label={props.label}
                            // @ts-ignore
                            value={params[props.filterName]}
                            setValue={(e) => {
                                if (params && setParams) {
                                    const newParams = {...params}
                                    // @ts-ignore
                                    newParams[props.filterName] = e
                                    setParams(newParams)
                                }
                            }}
                        />
                    </>
                ) : (
                    <>
                        {props.pureString ? (
                            <InputItem
                                style={{marginBottom: 4}}
                                label={props.label}
                                // @ts-ignore
                                value={params[props.filterName]}
                                setValue={(e) => {
                                    if (params && setParams) {
                                        const newParams = {...params}
                                        // @ts-ignore
                                        newParams[props.filterName] = e
                                        setParams(newParams)
                                    }
                                }}
                            />
                        ) : (
                            <ManyMultiSelectForString
                                mode={"tags"}
                                formItemStyle={{marginBottom: 4}}
                                label={props.label}
                                data={(props.autoCompletions || []).map((i) => {
                                    return {value: i, label: i}
                                })}
                                // @ts-ignore
                                value={params[props.filterName]}
                                setValue={(e) => {
                                    if (params && setParams) {
                                        const newParams = {...params}
                                        // @ts-ignore
                                        newParams[props.filterName] = e
                                        setParams(newParams)
                                    }
                                }}
                            />
                        )}
                    </>
                )}
                <Form.Item style={{marginBottom: 0, marginTop: 0}} colon={false} label={" "}>
                    <Space>
                        <Button type='primary' htmlType='submit'>
                            {" "}
                            设置搜索条件{" "}
                        </Button>
                        <Button
                            onClick={() => {
                                if (params && setParams) {
                                    const newParams = {...params}
                                    // @ts-ignore
                                    newParams[props.filterName] = ""
                                    setParams(newParams)
                                }
                            }}
                        >
                            {" "}
                            重置搜索{" "}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
}

export const onExpandHTTPFlow = (
    flow: HTTPFlow | undefined,
    onSendToFuzzer?: SendToFuzzerFunc,
    onClosed?: () => any
) => {
    if (!flow) {
        return <Empty>找不到该请求详情</Empty>
    }

    return (
        <div style={{width: "100%"}}>
            <HTTPFlowDetail
                hash={flow.Hash}
                sendToWebFuzzer={(isHttps, request) => {
                    if (onSendToFuzzer) onSendToFuzzer(new Buffer(request), isHttps)
                }}
                onClose={onClosed}
            />
        </div>
    )
}

export interface HTTPFlowTableProp {
    onSendToWebFuzzer?: (isHttps: boolean, request: string) => any
    onSelected?: (i?: HTTPFlow) => any
    noHeader?: boolean
    tableHeight?: number
    paginationPosition?: "topRight" | "bottomRight"
    params?: YakQueryHTTPFlowRequest
}

export const StatusCodeToColor = (code: number) => {
    if (code >= 400) {
        return "red"
    } else if (code < 400 && code >= 300) {
        return "orange"
    } else {
        return "green"
    }
}

export const DurationMsToColor = (code: number) => {
    if (code >= 600) {
        return "red"
    } else if (code < 600 && code >= 300) {
        return "orange"
    } else {
        return "green"
    }
}

export const LogLevelToCode = (level: string) => {
    switch (level.toLowerCase()) {
        case "info":
        case "information":
        case "low":
            return "blue"
        case "debug":
            return "gray"
        case "finished":
        case "success":
            return "green"
        case "fatal":
        case "error":
        case "panic":
        case "err":
        case "high":
        case "critical":
            return "red"
        case "warning":
        case "warn":
        case "middle":
            return "orange"
        default:
            return "blue"
    }
}

export interface YakQueryHTTPFlowResponse {
    Data: HTTPFlow[]
    Total: number
    Pagination: PaginationSchema
}

interface CompateData{
    content:string
    language:string
}

export const HTTPFlowTable: React.FC<HTTPFlowTableProp> = (props) => {
    const [data, setData] = useState<HTTPFlow[]>([])
    const [params, setParams] = useState<YakQueryHTTPFlowRequest>(
        props.params || {SourceType: "mitm"}
    )
    const [pagination, setPagination] = useState<PaginationSchema>({
        Limit: 20,
        Order: "desc",
        OrderBy: "updated_at",
        Page: 1
    })
    const [autoReload, setAutoReload] = useState(true)
    const [total, setTotal] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<HTTPFlow>()

    const [compareLeft,setCompareLeft] = useState<CompateData>({content:'',language:'http'})
    const [compareRight,setCompareRight] = useState<CompateData>({content:'',language:'http'})
    const [compareState,setCompareState] =useState(0)
    // 向主页发送对比数据
    useEffect(() => {
        if(compareLeft.content){
            const params={info:compareLeft,type:1}
            setCompareState(compareState===0?1:0)
            
            ipcRenderer.invoke("add-data-compare", params)
        } 
    }, [ compareLeft ])
    useEffect(() => {
        if(compareRight.content){
            const params={info:compareRight,type:2}
            setCompareState(compareState===0?2:0)
            
            ipcRenderer.invoke("add-data-compare", params)
        }
    }, [ compareRight ])

    const update = (
        page?: number,
        limit?: number,
        order?: string,
        orderBy?: string,
        sourceType?: string,
        noLoading?: boolean
    ) => {
        const paginationProps = {
            Page: page || 1,
            Limit: limit || pagination.Limit,
            Order: order || "desc",
            OrderBy: orderBy || "updated_at"
        }
        if (!noLoading) {
            setLoading(true)
            setAutoReload(false)
        }
        // yakQueryHTTPFlow({
        //     SourceType: sourceType, ...params,
        //     Pagination: {...paginationProps},
        // })
        ipcRenderer
            .invoke("QueryHTTPFlows", {
                SourceType: sourceType,
                ...params,
                Pagination: {...paginationProps}
            })
            .then((rsp: YakQueryHTTPFlowResponse) => {
                setData(rsp.Data)
                setPagination(rsp.Pagination)
                setTotal(rsp.Total)
            })
            .catch((e) => {
                failed(`query HTTP Flow failed: ${e}`)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const sortFilter = (column: string, type: any) => {
        const keyRelation: any = {
            UpdatedAt: "updated_at",
            BodyLength: "body_length"
        }

        if (column && type) {
            update(1, 20, type, keyRelation[column])
        } else {
            update(1, 20)
        }
    }

    useEffect(() => {
        props.onSelected && props.onSelected(selected)
    }, [selected])

    useEffect(() => {
        if (autoReload) {
            const id = setInterval(() => {
                update(1, undefined, "desc", undefined, undefined, true)
            }, 1000)
            return () => {
                clearInterval(id)
            }
        }
    }, [autoReload])

    return (
        <div style={{width: "100%", height: "100%", overflow: "auto"}}>
            {!props.noHeader && (
                <PageHeader
                    title={"HTTP History"}
                    subTitle={
                        <Space>
                            {"所有相关请求都在这里"}
                            <Button
                                icon={<ReloadOutlined/>}
                                type={"link"}
                                onClick={(e) => {
                                    update(1)
                                }}
                            />
                        </Space>
                    }
                    extra={[
                        <Space>
                            <Form.Item label={"选择 HTTP History 类型"} style={{marginBottom: 0}}>
                                <Select
                                    mode={"multiple"}
                                    value={params.SourceType}
                                    style={{minWidth: 200}}
                                    onChange={(e) => {
                                        setParams({...params, SourceType: e})
                                        setLoading(true)
                                        setTimeout(() => {
                                            update(1, undefined, undefined, undefined, e)
                                        }, 200)
                                    }}
                                >
                                    <Select.Option value={"mitm"}>mitm: 中间人劫持</Select.Option>
                                    <Select.Option value={"fuzzer"}>
                                        fuzzer: 模糊测试分析
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                            <Popconfirm
                                title={"确定想要删除所有记录吗？不可恢复"}
                                onConfirm={(e) => {
                                    ipcRenderer.invoke("delete-http-flows-all")
                                    setLoading(true)
                                    info("正在删除...如自动刷新失败请手动刷新")
                                    setTimeout(() => {
                                        update(1)
                                    }, 400)
                                }}
                            >
                                <Button danger={true}>清除全部历史记录？</Button>
                            </Popconfirm>
                        </Space>
                    ]}
                />
            )}
            {/*{false && (*/}
            {/*    <Table*/}
            {/*        className={"httpFlowTable"}*/}
            {/*        bordered={true}*/}
            {/*        title={(e) => {*/}
            {/*            return (*/}
            {/*                <Row>*/}
            {/*                    <Col span={16}>*/}
            {/*                        <Space>*/}
            {/*                            <span>HTTP History</span>*/}
            {/*                            <Button*/}
            {/*                                icon={<ReloadOutlined/>}*/}
            {/*                                type={"link"}*/}
            {/*                                size={"small"}*/}
            {/*                                onClick={(e) => {*/}
            {/*                                    update(1)*/}
            {/*                                }}*/}
            {/*                            />*/}
            {/*                            <Space>*/}
            {/*                                自动刷新:*/}
            {/*                                <Switch*/}
            {/*                                    size={"small"}*/}
            {/*                                    checked={autoReload}*/}
            {/*                                    onChange={setAutoReload}*/}
            {/*                                />*/}
            {/*                            </Space>*/}
            {/*                            <Input.Search*/}
            {/*                                placeholder={"URL关键字"}*/}
            {/*                                enterButton={true}*/}
            {/*                                size={"small"}*/}
            {/*                                style={{width: 170}}*/}
            {/*                                value={params.SearchURL}*/}
            {/*                                onChange={(e) => {*/}
            {/*                                    setParams({...params, SearchURL: e.target.value})*/}
            {/*                                }}*/}
            {/*                                onSearch={(v) => {*/}
            {/*                                    update(1)*/}
            {/*                                }}*/}
            {/*                            />*/}
            {/*                            {props.noHeader && (*/}
            {/*                                <Popconfirm*/}
            {/*                                    title={"确定想要删除所有记录吗？不可恢复"}*/}
            {/*                                    onConfirm={(e) => {*/}
            {/*                                        ipcRenderer.invoke("delete-http-flows-all")*/}
            {/*                                        setLoading(true)*/}
            {/*                                        info("正在删除...如自动刷新失败请手动刷新")*/}
            {/*                                        setTimeout(() => {*/}
            {/*                                            update(1)*/}
            {/*                                            setTimeout(() => {*/}
            {/*                                                setAutoReload(true)*/}
            {/*                                            }, 1000)*/}
            {/*                                        }, 400)*/}
            {/*                                    }}*/}
            {/*                                >*/}
            {/*                                    <Button danger={true} size={"small"}>*/}
            {/*                                        删除历史记录*/}
            {/*                                    </Button>*/}
            {/*                                </Popconfirm>*/}
            {/*                            )}*/}
            {/*                        </Space>*/}
            {/*                    </Col>*/}
            {/*                    <Col span={8} style={{textAlign: "right"}}>*/}
            {/*                        <Pagination*/}
            {/*                            // simple={true}*/}
            {/*                            size={"small"}*/}
            {/*                            pageSize={pagination.Limit || 10}*/}
            {/*                            total={total}*/}
            {/*                            showTotal={(e) => <Tag>{e} Records</Tag>}*/}
            {/*                            onChange={(page, limit) => {*/}
            {/*                                setAutoReload(false)*/}
            {/*                                update(page, limit)*/}
            {/*                            }}*/}
            {/*                            onShowSizeChange={(_, limit) => {*/}
            {/*                                setAutoReload(false)*/}
            {/*                                update(1, limit)*/}
            {/*                            }}*/}
            {/*                            defaultCurrent={1}*/}
            {/*                        />*/}
            {/*                    </Col>*/}
            {/*                </Row>*/}
            {/*            )*/}
            {/*        }}*/}
            {/*        size={"small"}*/}
            {/*        loading={loading}*/}
            {/*        rowKey={"Hash"}*/}
            {/*        pagination={false}*/}
            {/*        // pagination={{*/}
            {/*        //     size: "small", simple: true, position: [props.paginationPosition || "bottomRight"],*/}
            {/*        //     pageSize: pagination?.Limit || 10,*/}
            {/*        //     total, showTotal: (i) => <Tag>共{i}条历史记录</Tag>,*/}
            {/*        //     // onChange(page: number, limit?: number): any {*/}
            {/*        //     //     update(page, limit)*/}
            {/*        //     // },*/}
            {/*        // }}*/}
            {/*        rowClassName={(e: HTTPFlow) => {*/}
            {/*            return e.Hash === selected?.Hash ? "selected" : ""*/}
            {/*        }}*/}
            {/*        onRow={(record: HTTPFlow) => {*/}
            {/*            return {*/}
            {/*                onClick: (ev) => {*/}
            {/*                    if (record.Hash === selected?.Hash) {*/}
            {/*                        setSelected(undefined)*/}
            {/*                    } else {*/}
            {/*                        setSelected(record)*/}
            {/*                    }*/}
            {/*                },*/}
            {/*                onContextMenu: (ev) => {*/}
            {/*                    showByCursorContainer(*/}
            {/*                        {*/}
            {/*                            content: (*/}
            {/*                                <>*/}
            {/*                                    <List bordered={true}>*/}
            {/*                                        <List.Item key={"123"}>*/}
            {/*                                            <Button*/}
            {/*                                                onClick={() => {*/}
            {/*                                                    if (props.onSendToWebFuzzer) {*/}
            {/*                                                        props.onSendToWebFuzzer(*/}
            {/*                                                            record.IsHTTPS,*/}
            {/*                                                            new Buffer(*/}
            {/*                                                                record.Request*/}
            {/*                                                            ).toString("utf8")*/}
            {/*                                                        )*/}
            {/*                                                    }*/}
            {/*                                                }}*/}
            {/*                                            >*/}
            {/*                                                发送到 Web Fuzzer*/}
            {/*                                            </Button>*/}
            {/*                                        </List.Item>*/}
            {/*                                    </List>*/}
            {/*                                </>*/}
            {/*                            )*/}
            {/*                        },*/}
            {/*                        ev.clientX,*/}
            {/*                        ev.clientY*/}
            {/*                    )*/}
            {/*                }*/}
            {/*            }*/}
            {/*        }}*/}
            {/*        scroll={{x: "auto", y: props.tableHeight}}*/}
            {/*        onChange={(paging: any, _: any, sorter: SorterResult<HTTPFlow>) => {*/}
            {/*            if (sorter.order && sorter.columnKey) {*/}
            {/*                update(*/}
            {/*                    paging.current,*/}
            {/*                    paging.pageSize,*/}
            {/*                    sorter.order,*/}
            {/*                    `${sorter.columnKey}`*/}
            {/*                )*/}
            {/*            } else {*/}
            {/*                update(paging.current, paging.pageSize)*/}
            {/*            }*/}
            {/*        }}*/}
            {/*        columns={[*/}
            {/*            {*/}
            {/*                // fixed: "left",*/}
            {/*                // defaultSortOrder: "descend",*/}
            {/*                key: "updated_at",*/}
            {/*                sorter: params && true,*/}
            {/*                title: "请求时间",*/}
            {/*                render: (i: HTTPFlow) => <Tag>{formatTimestamp(i.UpdatedAt)}</Tag>,*/}
            {/*                width: 60*/}
            {/*            },*/}
            {/*            {*/}
            {/*                // fixed: "left",*/}
            {/*                filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => {*/}
            {/*                    return (*/}
            {/*                        params &&*/}
            {/*                        setParams && (*/}
            {/*                            <HTTLFlowFilterDropdownForm*/}
            {/*                                label={"搜索方法"}*/}
            {/*                                params={params}*/}
            {/*                                setParams={setParams}*/}
            {/*                                filterName={"Methods"}*/}
            {/*                                autoCompletions={["GET", "POST", "HEAD"]}*/}
            {/*                                confirm={confirm}*/}
            {/*                                setSelectedKeys={setSelectedKeys}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                filterIcon: (filtered) => {*/}
            {/*                    return (*/}
            {/*                        params && (*/}
            {/*                            <SearchOutlined*/}
            {/*                                style={{color: filtered ? "#1890ff" : undefined}}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                title: "方法",*/}
            {/*                render: (i: HTTPFlow) => (*/}
            {/*                    <Tag color={"geekblue"} style={{marginRight: 20}}>*/}
            {/*                        {i.Method}*/}
            {/*                    </Tag>*/}
            {/*                )*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "状态码",*/}
            {/*                filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => {*/}
            {/*                    return (*/}
            {/*                        params &&*/}
            {/*                        setParams && (*/}
            {/*                            <HTTLFlowFilterDropdownForm*/}
            {/*                                label={"搜索状态码"}*/}
            {/*                                params={params}*/}
            {/*                                setParams={setParams}*/}
            {/*                                filterName={"StatusCode"}*/}
            {/*                                autoCompletions={[*/}
            {/*                                    "200",*/}
            {/*                                    "300-305",*/}
            {/*                                    "400-404",*/}
            {/*                                    "500-502",*/}
            {/*                                    "200-299",*/}
            {/*                                    "300-399",*/}
            {/*                                    "400-499"*/}
            {/*                                ]}*/}
            {/*                                confirm={confirm}*/}
            {/*                                setSelectedKeys={setSelectedKeys}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                filterIcon: (filtered) => {*/}
            {/*                    return (*/}
            {/*                        params && (*/}
            {/*                            <SearchOutlined*/}
            {/*                                style={{color: filtered ? "#1890ff" : undefined}}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                render: (i: HTTPFlow) => (*/}
            {/*                    <Tag*/}
            {/*                        color={StatusCodeToColor(i.StatusCode)}*/}
            {/*                        style={{marginRight: 30}}*/}
            {/*                    >*/}
            {/*                        {i.StatusCode}*/}
            {/*                    </Tag>*/}
            {/*                )*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "URL",*/}
            {/*                render: (i: HTTPFlow) => {*/}
            {/*                    return (*/}
            {/*                        <div style={{overflow: "auto"}}>*/}
            {/*                            <Space>*/}
            {/*                                {!params.SearchURL ? (*/}
            {/*                                    <Text*/}
            {/*                                        style={{width: 570}}*/}
            {/*                                        copyable={true}*/}
            {/*                                        ellipsis={{tooltip: false}}*/}
            {/*                                    >*/}
            {/*                                        {i.Url}*/}
            {/*                                    </Text>*/}
            {/*                                ) : (*/}
            {/*                                    <div style={{width: 600, overflow: "hidden"}}>*/}
            {/*                                        <Highlighter*/}
            {/*                                            searchWords={[params.SearchURL]}*/}
            {/*                                            textToHighlight={i.Url}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}
            {/*                                )}*/}
            {/*                            </Space>*/}
            {/*                        </div>*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                width: 600,*/}
            {/*                filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => {*/}
            {/*                    return (*/}
            {/*                        params &&*/}
            {/*                        setParams && (*/}
            {/*                            <HTTLFlowFilterDropdownForm*/}
            {/*                                label={"搜索URL关键字"}*/}
            {/*                                params={params}*/}
            {/*                                setParams={setParams}*/}
            {/*                                filterName={"SearchURL"}*/}
            {/*                                pureString={true}*/}
            {/*                                confirm={confirm}*/}
            {/*                                setSelectedKeys={setSelectedKeys}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                filterIcon: (filtered) => {*/}
            {/*                    return (*/}
            {/*                        params && (*/}
            {/*                            <SearchOutlined*/}
            {/*                                style={{color: filtered ? "#1890ff" : undefined}}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                }*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "IP",*/}
            {/*                render: (i: HTTPFlow) => {*/}
            {/*                    return i.IPAddress*/}
            {/*                }*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "URL 长度",*/}
            {/*                render: (i: HTTPFlow) => {*/}
            {/*                    const len = (i.Url || "").length*/}
            {/*                    return len > 0 && <div style={{marginRight: 40}}>{len}</div>*/}
            {/*                }*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "参数",*/}
            {/*                render: (i: HTTPFlow) => {*/}
            {/*                    return (*/}
            {/*                        <Space style={{width: 50}}>*/}
            {/*                            {(i.GetParamsTotal > 0 || i.PostParamsTotal > 0) && (*/}
            {/*                                <CheckOutlined/>*/}
            {/*                            )}*/}
            {/*                            /!*{i.GetParamsTotal > 0 && <Tag color={"geekblue"}>GET<CheckOutlined/></Tag>}*!/*/}
            {/*                            /!*{i.PostParamsTotal > 0 && <Tag color={"blue"}>POST<CheckOutlined/></Tag>}*!/*/}
            {/*                            /!*{i.CookieParamsTotal > 0 && <Tag>Cookie</Tag>}*!/*/}
            {/*                        </Space>*/}
            {/*                    )*/}
            {/*                },*/}
            {/*                filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => {*/}
            {/*                    return (*/}
            {/*                        params &&*/}
            {/*                        setParams && (*/}
            {/*                            <HTTLFlowFilterDropdownForm*/}
            {/*                                label={"过滤是否存在基础参数"}*/}
            {/*                                params={params}*/}
            {/*                                setParams={setParams}*/}
            {/*                                filterName={"HaveCommonParams"}*/}
            {/*                                pureBool={true}*/}
            {/*                                confirm={confirm}*/}
            {/*                                setSelectedKeys={setSelectedKeys}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                }*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "响应长度",*/}
            {/*                sorter: params && true,*/}
            {/*                key: "body_length",*/}
            {/*                render: (i: HTTPFlow) => (*/}
            {/*                    <div style={{width: 100}}>*/}
            {/*                        <Tag>*/}
            {/*                            {i.BodySizeVerbose ? i.BodySizeVerbose : i.BodyLength}*/}
            {/*                        </Tag>*/}
            {/*                    </div>*/}
            {/*                ),*/}
            {/*                filterDropdown: ({setSelectedKeys, selectedKeys, confirm}) => {*/}
            {/*                    return (*/}
            {/*                        params &&*/}
            {/*                        setParams && (*/}
            {/*                            <HTTLFlowFilterDropdownForm*/}
            {/*                                label={"是否存在Body？"}*/}
            {/*                                params={params}*/}
            {/*                                setParams={setParams}*/}
            {/*                                filterName={"HaveBody"}*/}
            {/*                                pureBool={true}*/}
            {/*                                confirm={confirm}*/}
            {/*                                setSelectedKeys={setSelectedKeys}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    )*/}
            {/*                }*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "响应类型",*/}
            {/*                render: (i: HTTPFlow) => (*/}
            {/*                    <Tag>*/}
            {/*                        {i.ContentType.split(";")*/}
            {/*                            .map((i) => i.trim())*/}
            {/*                            .filter((i) => !i.startsWith("charset"))*/}
            {/*                            .join(",") || "-"}*/}
            {/*                    </Tag>*/}
            {/*                )*/}
            {/*            },*/}
            {/*            {*/}
            {/*                title: "操作",*/}
            {/*                render: (record: HTTPFlow) => (*/}
            {/*                    <Space>*/}
            {/*                        /!*<Button size={"small"} type={"primary"} onClick={e => {*!/*/}
            {/*                        /!*    if (props.onSendToWebFuzzer) props.onSendToWebFuzzer(record.IsHTTPS, new Buffer(record.Request).toString("utf8"))*!/*/}
            {/*                        /!*}}>发送到 Fuzzer</Button>*!/*/}
            {/*                        <Button*/}
            {/*                            size={"small"}*/}
            {/*                            type={"primary"}*/}
            {/*                            onClick={(e) => {*/}
            {/*                                let m = showDrawer({*/}
            {/*                                    width: "80%",*/}
            {/*                                    content: onExpandHTTPFlow(*/}
            {/*                                        record,*/}
            {/*                                        (req: Uint8Array, isHttps: boolean) => {*/}
            {/*                                            if (props.onSendToWebFuzzer) {*/}
            {/*                                                props.onSendToWebFuzzer(*/}
            {/*                                                    isHttps,*/}
            {/*                                                    new Buffer(req).toString()*/}
            {/*                                                )*/}
            {/*                                                m.destroy()*/}
            {/*                                            }*/}
            {/*                                        }*/}
            {/*                                    )*/}
            {/*                                })*/}
            {/*                            }}*/}
            {/*                        >*/}
            {/*                            详情*/}
            {/*                        </Button>*/}
            {/*                    </Space>*/}
            {/*                )*/}
            {/*            }*/}
            {/*        ]}*/}
            {/*        dataSource={data}*/}
            {/*    ></Table>*/}
            {/*)}*/}
            <Row style={{margin: "5px 0 5px 5px"}}>
                <Col span={16}>
                    <Space>
                        <span>HTTP History</span>
                        <Button
                            icon={<ReloadOutlined/>}
                            type={"link"}
                            size={"small"}
                            onClick={(e) => {
                                update(1, undefined, "desc")
                            }}
                        />
                        <Space>
                            自动刷新:
                            <Switch size={"small"} checked={autoReload} onChange={setAutoReload}/>
                        </Space>
                        <Input.Search
                            placeholder={"URL关键字"}
                            enterButton={true}
                            size={"small"}
                            style={{width: 170}}
                            value={params.SearchURL}
                            onChange={(e) => {
                                setParams({...params, SearchURL: e.target.value})
                            }}
                            onSearch={(v) => {
                                update(1)
                            }}
                        />
                        {props.noHeader && (
                            <Popconfirm
                                title={"确定想要删除所有记录吗？不可恢复"}
                                onConfirm={(e) => {
                                    ipcRenderer.invoke("delete-http-flows-all")
                                    setLoading(true)
                                    info("正在删除...如自动刷新失败请手动刷新")
                                    setCompareLeft({content:'',language:'http'})
                                    setCompareRight({content:'',language:'http'})
                                    setCompareState(0)
                                    setTimeout(() => {
                                        update(1)
                                        setTimeout(() => {
                                            setAutoReload(true)
                                        }, 1000)
                                    }, 400)
                                }}
                            >
                                <Button danger={true} size={"small"}>
                                    删除历史记录
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                </Col>
                <Col span={8} style={{textAlign: "right"}}>
                    <Pagination
                        // simple={true}
                        size={"small"}
                        showSizeChanger={true}
                        pageSize={pagination.Limit || 10}
                        total={total}
                        showTotal={(e) => <Tag>{e} Records</Tag>}
                        onChange={(page, limit) => {
                            setAutoReload(false)
                            update(page, limit)
                        }}
                        onShowSizeChange={(_, limit) => {
                            setAutoReload(false)
                            update(1, limit)
                        }}
                        defaultCurrent={1}
                    />
                </Col>
            </Row>
            {(
                <TableResizableColumn
                    className={"httpFlowTable"}
                    loading={loading}
                    columns={[
                        // {
                        //     dataKey: "UpdatedAt",
                        //     sortable: params && true,
                        //     width: 160,
                        //     headRender: () => {
                        //         return "请求时间"
                        //     },
                        //     cellRender: ({rowData, dataKey, ...props}: any) => {
                        //         return <Tag>{formatTimestamp(rowData[dataKey])}</Tag>
                        //     }
                        // },
                        {
                            dataKey: "Method",
                            width: 70,
                            headRender: (params1: any) => {
                                return (
                                    <div
                                        style={{display: "flex", justifyContent: "space-between"}}
                                    >
                                        方法
                                        <Popover
                                            placement='bottom'
                                            trigger='click'
                                            content={
                                                params &&
                                                setParams && (
                                                    <HTTLFlowFilterDropdownForms
                                                        label={"搜索方法"}
                                                        params={params}
                                                        setParams={setParams}
                                                        filterName={"Methods"}
                                                        autoCompletions={["GET", "POST", "HEAD"]}
                                                        submitFilter={() => update(1)}
                                                    />
                                                )
                                            }
                                        >
                                            <Button
                                                style={{
                                                    paddingLeft: 4, paddingRight: 4, marginLeft: 4,
                                                    color: !!params.Methods ? undefined : "gray",
                                                }}
                                                type={!!params.Methods ? "primary" : "link"} size={"small"}
                                                icon={<SearchOutlined/>}
                                            />
                                        </Popover>
                                    </div>
                                )
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return (
                                    <Tag color={"geekblue"} style={{marginRight: 20}}>
                                        {rowData[dataKey]}
                                    </Tag>
                                )
                            }
                        },
                        {
                            dataKey: "StatusCode",
                            width: 90,
                            headRender: () => {
                                return (
                                    <div
                                        style={{display: "flex", justifyContent: "space-between"}}
                                    >
                                        状态码
                                        <Popover
                                            placement='bottom'
                                            trigger='click'
                                            content={
                                                params &&
                                                setParams && (
                                                    <HTTLFlowFilterDropdownForms
                                                        label={"搜索状态码"}
                                                        params={params}
                                                        setParams={setParams}
                                                        filterName={"StatusCode"}
                                                        autoCompletions={[
                                                            "200",
                                                            "300-305",
                                                            "400-404",
                                                            "500-502",
                                                            "200-299",
                                                            "300-399",
                                                            "400-499"
                                                        ]}
                                                        submitFilter={() => update(1)}
                                                    />
                                                )
                                            }
                                        >
                                            <Button
                                                style={{
                                                    paddingLeft: 4, paddingRight: 4, marginLeft: 4,
                                                    color: !!params.StatusCode ? undefined : "gray",
                                                }}
                                                type={!!params.StatusCode ? "primary" : "link"} size={"small"}
                                                icon={<SearchOutlined/>}
                                            />
                                        </Popover>
                                    </div>
                                )
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return (
                                    <Tag color={StatusCodeToColor(rowData[dataKey])}>
                                        {rowData[dataKey]}
                                    </Tag>
                                )
                            }
                        },
                        {
                            dataKey: "Url",
                            resizable: true,
                            headRender: () => {
                                return (
                                    <div
                                        style={{display: "flex", justifyContent: "space-between"}}
                                    >
                                        URL
                                        <Popover
                                            placement='bottom'
                                            trigger='click'
                                            content={
                                                params &&
                                                setParams && (
                                                    <HTTLFlowFilterDropdownForms
                                                        label={"搜索URL关键字"}
                                                        params={params}
                                                        setParams={setParams}
                                                        filterName={"SearchURL"}
                                                        pureString={true}
                                                        submitFilter={() => update(1)}
                                                    />
                                                )
                                            }
                                        >
                                            <Button
                                                style={{
                                                    paddingLeft: 4, paddingRight: 4, marginLeft: 4,
                                                    color: !!params.SearchURL ? undefined : "gray",
                                                }}
                                                type={!!params.SearchURL ? "primary" : "link"} size={"small"}
                                                icon={<SearchOutlined/>}
                                            />
                                        </Popover>
                                    </div>
                                )
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return (
                                    <div style={{width: "100%", display: "flex"}}>
                                        <div className='resize-ellipsis'>
                                            {!params.SearchURL ? (
                                                rowData.Url
                                            ) : (
                                                <Highlighter
                                                    searchWords={[params.SearchURL]}
                                                    textToHighlight={rowData.Url}
                                                />
                                            )}
                                        </div>
                                        <CopyToClipboard
                                            text={`${rowData.Url}`}
                                            onCopy={(text, ok) => {
                                                if (ok) success("已复制到粘贴板")
                                            }}
                                        >
                                            <Button type={"link"} size={"small"}>
                                                <CopyOutlined
                                                    style={{
                                                        paddingLeft: 5,
                                                        paddingTop: 5,
                                                        cursor: "pointer"
                                                    }}
                                                />
                                            </Button>
                                        </CopyToClipboard>
                                    </div>
                                )
                            },
                            width: 600
                        },
                        {
                            dataKey: "HtmlTitle",
                            width: 120,
                            resizable: true,
                            headRender: () => {
                                return "Html Title"
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return rowData[dataKey] ? <>{rowData[dataKey]}</> : ""
                            }
                        },
                        {
                            dataKey: "IPAddress",
                            width: 120, resizable: true,
                            headRender: () => {
                                return "IP"
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return rowData[dataKey] ? <>{rowData[dataKey]}</> : ""
                            }
                        },
                        {
                            dataKey: "BodyLength",
                            // sortable: params && true,
                            headRender: () => {
                                return (
                                    <div style={{display: "inline-block", position: "relative"}}>
                                        响应长度
                                        <Popover
                                            placement='bottom'
                                            trigger='click'
                                            content={
                                                params &&
                                                setParams && (
                                                    <HTTLFlowFilterDropdownForms
                                                        label={"是否存在Body？"}
                                                        params={params}
                                                        setParams={setParams}
                                                        filterName={"HaveBody"}
                                                        pureBool={true}
                                                        submitFilter={() => update(1)}
                                                    />
                                                )
                                            }
                                        >
                                            <Button
                                                style={{
                                                    paddingLeft: 4, paddingRight: 4, marginLeft: 4,
                                                    color: !!params.HaveBody ? undefined : "gray",
                                                }}
                                                type={!!params.HaveBody ? "primary" : "link"} size={"small"}
                                                icon={<SearchOutlined/>}
                                            />
                                        </Popover>
                                    </div>
                                )
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return (
                                    <div style={{width: 100}}>
                                        <Tag>
                                            {rowData.BodySizeVerbose
                                                ? rowData.BodySizeVerbose
                                                : rowData.BodyLength}
                                        </Tag>
                                    </div>
                                )
                            }
                        },
                        // {
                        //     dataKey: "UrlLength",
                        //     width: 90,
                        //     headRender: () => {
                        //         return "URL 长度"
                        //     },
                        //     cellRender: ({rowData, dataKey, ...props}: any) => {
                        //         const len = (rowData.Url || "").length
                        //         return len > 0 ? <div>{len}</div> : "-"
                        //     }
                        // },
                        {
                            dataKey: "GetParamsTotal",
                            width: 65,
                            align: "center",
                            headRender: () => {
                                return (
                                    <div
                                        style={{display: "flex", justifyContent: "space-between"}}
                                    >
                                        参数
                                        <Popover
                                            placement='bottom'
                                            trigger='click'
                                            content={
                                                params &&
                                                setParams && (
                                                    <HTTLFlowFilterDropdownForms
                                                        label={"过滤是否存在基础参数"}
                                                        params={params}
                                                        setParams={setParams}
                                                        filterName={"HaveCommonParams"}
                                                        pureBool={true}
                                                        submitFilter={() => update(1)}
                                                    />
                                                )
                                            }
                                        >
                                            <Button
                                                style={{
                                                    paddingLeft: 4, paddingRight: 4, marginLeft: 4,
                                                    color: !!params.HaveCommonParams ? undefined : "gray",
                                                }}
                                                type={!!params.HaveCommonParams ? "primary" : "link"} size={"small"}
                                                icon={<SearchOutlined/>}
                                            />
                                        </Popover>
                                    </div>
                                )
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                return (
                                    <Space>
                                        {(rowData.GetParamsTotal > 0 ||
                                            rowData.PostParamsTotal > 0) && <CheckOutlined/>}
                                    </Space>
                                )
                            }
                        },
                        {
                            dataKey: "ContentType",
                            resizable: true, width: 80,
                            headRender: () => {
                                return "响应类型"
                            },
                            cellRender: ({rowData, dataKey, ...props}: any) => {
                                let contentTypeFixed = rowData.ContentType.split(";")
                                    .map((el: any) => el.trim())
                                    .filter((i: any) => !i.startsWith("charset"))
                                    .join(",") || "-"
                                if (contentTypeFixed.includes("/")) {
                                    const contentTypeFixedNew = contentTypeFixed.split("/").pop()
                                    if (!!contentTypeFixedNew) {
                                        contentTypeFixed = contentTypeFixedNew
                                    }
                                }
                                return (
                                    <div>
                                        <Tag>
                                            {contentTypeFixed}
                                        </Tag>
                                    </div>
                                )
                            }
                        },
                        {
                            dataKey: "operate",
                            width: 90,
                            headRender: () => "操作",
                            cellRender: ({rowData}: any) => {
                                return (
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        onClick={(e) => {
                                            let m = showDrawer({
                                                width: "80%",
                                                content: onExpandHTTPFlow(
                                                    rowData,
                                                    (req: Uint8Array, isHttps: boolean) => {
                                                        if (props.onSendToWebFuzzer) {
                                                            props.onSendToWebFuzzer(
                                                                isHttps,
                                                                new Buffer(req).toString()
                                                            )
                                                            m.destroy()
                                                        }
                                                    }
                                                )
                                            })
                                        }}
                                    >
                                        详情
                                    </Button>
                                )
                            }
                        }
                    ]}
                    data={data}
                    autoHeight={true}
                    sortFilter={sortFilter}
                    rowClassName={(rowData: any) => {
                        return rowData ? (rowData.Hash === selected?.Hash ? "selected" : "") : ""
                    }}
                    onRowContextMenu={(rowData: any, event: React.MouseEvent) => {
                        showByCursorMenu(
                            {
                                content:[
                                    {
                                        title:'发送到 Web Fuzzer',
                                        onClick:()=>{
                                            if (props.onSendToWebFuzzer) {
                                                props.onSendToWebFuzzer(
                                                    rowData.IsHTTPS,
                                                    new Buffer(
                                                        rowData.Request
                                                    ).toString("utf8")
                                                )
                                            }
                                        }
                                    },
                                    {
                                        title:'发送到对比器左侧',
                                        onClick:()=>{
                                            setCompareLeft({
                                                content:new Buffer(rowData.Request).toString("utf8"),
                                                language:'http'
                                            })
                                        },
                                        disabled: [false,true,false][compareState]
                                    },
                                    {
                                        title:'发送到对比器右侧',
                                        onClick:()=>{
                                            setCompareRight({
                                                content:new Buffer(rowData.Request).toString("utf8"),
                                                language:'http'
                                            })
                                        },
                                        disabled: [false,false,true][compareState]
                                    }
                                ]
                            },
                            event.clientX,
                            event.clientY
                        )
                    }}
                    onRowClick={(rowDate: any) => {
                        if (rowDate.Hash === selected?.Hash) {
                            setSelected(undefined)
                        } else {
                            setSelected(rowDate)
                        }
                    }}
                />
            )}
        </div>
    )
}
