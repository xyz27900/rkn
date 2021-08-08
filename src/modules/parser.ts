import { ParseRecordOutput } from '@/modules/csvParser';

type ResourceLockType = 'ip' | 'domain' | 'mask' | 'link';
type ResourceLockInfo<T extends ResourceLockType> = {
  initiator: string;
  type: T;
}

type ResourceLockIP = ResourceLockInfo<'ip'>;
type ResourceLockDomain = ResourceLockInfo<'domain'>;
type ResourceLockMask = ResourceLockInfo<'mask'>;
type ResourceLockLink = ResourceLockInfo<'link'> & { urls: Set<string> };

type ResourceLock = ResourceLockIP | ResourceLockDomain | ResourceLockMask | ResourceLockLink;

type ParserGetArgs = { deep: boolean };
type ParserHandleArgs = { isIP: boolean };

export class Parser {
  protected readonly domainResolving: Map<string, ResourceLock> = new Map();

  private static handleAddress(record: ResourceLock, address: string): boolean {
    if (record.type !== 'link') {
      return true;
    }

    if (address.indexOf('https://') === 0) {
      return [...record.urls.values()].some(url => url.indexOf('https://') === 0);
    } else {
      return record.urls.has(address);
    }
  }

  private static handleIP(record: ResourceLock, address: string): boolean {
    if (record.type === 'ip' || record.type === 'domain') {
      return true;
    }
    return record.type === 'link' && record.urls.has(address);
  }

  private cyclicParser(domain: string): ResourceLock | null {
    const items = domain.split('.');
    while (items.length > 1) {
      const search = items.join('.');
      const record = this.domainResolving.get(search);
      if (record && (search.length === domain.length || record.type === 'mask')) {
        return record;
      }
      items.shift();
    }
    return null;
  }

  public processData(record: ParseRecordOutput): void {
    const { initiator, ips, target, urls } = record;
    const selfResolving = target.length === 0;
    const keys = selfResolving ? ips : [target];
    keys.forEach(key => {
      const clearedKey = key.replace('*.', '');
      const record = this.domainResolving.get(key);
      if (!record) {
        const urlSet = new Set(urls);
        const lock: ResourceLock = urlSet.size > 0
          ? { initiator, type: 'link', urls: urlSet }
          : target.indexOf('*.') === 0
            ? { initiator, type: 'mask' }
            : { initiator, type: selfResolving ? 'ip' : 'domain' };
        this.domainResolving.set(clearedKey, lock);
        return;
      }

      if (record.type !== 'link') {
        return;
      }

      const urlSet = new Set(urls);
      const lock: ResourceLock = { ...record, urls: new Set([...record.urls, ...urlSet]) };
      this.domainResolving.set(clearedKey, lock);
    });
  }

  public get(key: string, args?: ParserGetArgs): ResourceLock | null {
    if (args?.deep) {
      return this.cyclicParser(key);
    } else {
      return this.domainResolving.get(key) ?? null;
    }
  }

  public handle(record: ResourceLock, value: string, args?: ParserHandleArgs): boolean {
    if (args?.isIP) {
      return Parser.handleIP(record, value);
    } else {
      return Parser.handleAddress(record, value);
    }
  }
}
