import { Random } from '../../random/generator/Random';
import { Arbitrary } from '../arbitrary/definition/Arbitrary';
import { Shrinkable } from '../arbitrary/definition/Shrinkable';
import { PreconditionFailure } from '../precondition/PreconditionFailure';
import { IRawProperty, runIdToFrequency } from './IRawProperty';
import { readConfigureGlobal } from '../runner/configuration/GlobalParameters';

/** @public */
type HookFunction = () => void;

/**
 * Interface for synchronous property, see {@link IRawProperty}
 * @public
 */
export interface IProperty<Ts> extends IRawProperty<Ts, false> {}

/**
 * Interface for synchronous property defining hooks, see {@link IProperty}
 * @public
 */
export interface IPropertyWithHooks<Ts> extends IProperty<Ts> {
  /**
   * Define a function that should be called before all calls to the predicate
   * @param invalidHookFunction - Function to be called, please provide a valid hook function
   */
  beforeEach(
    invalidHookFunction: () => Promise<unknown>
  ): 'beforeEach expects a synchronous function but was given a function returning a Promise';

  /**
   * Define a function that should be called before all calls to the predicate
   * @param hookFunction - Function to be called
   */
  beforeEach(hookFunction: HookFunction): IPropertyWithHooks<Ts>;

  /**
   * Define a function that should be called after all calls to the predicate
   * @param invalidHookFunction - Function to be called, please provide a valid hook function
   */
  afterEach(
    invalidHookFunction: () => Promise<unknown>
  ): 'afterEach expects a synchronous function but was given a function returning a Promise';
  /**
   * Define a function that should be called after all calls to the predicate
   * @param hookFunction - Function to be called
   */
  afterEach(hookFunction: HookFunction): IPropertyWithHooks<Ts>;
}

/**
 * Property, see {@link IProperty}
 *
 * Prefer using {@link property} instead
 *
 * @internal
 */
export class Property<Ts> implements IProperty<Ts>, IPropertyWithHooks<Ts> {
  static dummyHook: HookFunction = () => {};
  private beforeEachHook: HookFunction;
  private afterEachHook: HookFunction;
  constructor(readonly arb: Arbitrary<Ts>, readonly predicate: (t: Ts) => boolean | void) {
    const { beforeEach = Property.dummyHook, afterEach = Property.dummyHook } = readConfigureGlobal() || {};
    this.beforeEachHook = beforeEach;
    this.afterEachHook = afterEach;
  }
  isAsync = () => false as const;
  generate(mrng: Random, runId?: number): Shrinkable<Ts> {
    return runId != null ? this.arb.withBias(runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
  }
  run(v: Ts): PreconditionFailure | string | null {
    this.beforeEachHook();
    try {
      const output = this.predicate(v);
      return output == null || output === true ? null : 'Property failed by returning false';
    } catch (err) {
      // precondition failure considered as success for the first version
      if (PreconditionFailure.isFailure(err)) return err;
      // exception as string in case of real failure
      if (err instanceof Error && err.stack) return `${err}\n\nStack trace: ${err.stack}`;
      return `${err}`;
    } finally {
      this.afterEachHook();
    }
  }

  beforeEach(invalidHookFunction: () => Promise<unknown>): never;
  beforeEach(validHookFunction: HookFunction): Property<Ts>;
  beforeEach(hookFunction: HookFunction): unknown {
    this.beforeEachHook = hookFunction;
    return this;
  }

  afterEach(invalidHookFunction: () => Promise<unknown>): never;
  afterEach(hookFunction: HookFunction): Property<Ts>;
  afterEach(hookFunction: HookFunction): unknown {
    this.afterEachHook = hookFunction;
    return this;
  }
}
