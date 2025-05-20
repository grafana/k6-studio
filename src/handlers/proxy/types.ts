export enum ProxyHandler {
  Start = 'proxy:start',
  Stop = 'proxy:stop',
  Close = 'proxy:close',
  GetStatus = 'proxy:status:get',
  ChangeStatus = 'proxy:status:change',
  Data = 'proxy:data',
  CheckHealth = 'proxy:health:check',
}
