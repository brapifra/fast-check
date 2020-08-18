[Home](/) &gt; [fast-check](../fast-check.md) &gt; [SchedulerConstraints](SchedulerConstraints.md)

## SchedulerConstraints interface


<b>Signature:</b>

```typescript
export interface SchedulerConstraints 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [act](SchedulerConstraints.md#act) | <code>(f: () =&gt; Promise&lt;void&gt;) =&gt; Promise&lt;unknown&gt;</code> | Ensure that all scheduled tasks will be executed in the right context (for instance it can be the <code>act</code> of React) |

### act

Ensure that all scheduled tasks will be executed in the right context (for instance it can be the `act` of React)

<b>Signature:</b>

```typescript
act: (f: () => Promise<void>) => Promise<unknown>;
```
