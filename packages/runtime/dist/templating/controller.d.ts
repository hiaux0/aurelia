import { IContainer, IIndexable, IServiceLocator } from '@aurelia/kernel';
import { HooksDefinition, IElementHydrationOptions, TemplateDefinition } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags, State } from '../flags';
import { IBinding, IController, ILifecycle, IRenderContext, IViewCache, IViewModel, ViewModelKind } from '../lifecycle';
import { ILifecycleTask, MaybePromiseOrTask } from '../lifecycle-task';
import { IBindingTargetAccessor, IScope } from '../observation';
import { ITemplate } from '../rendering-engine';
import { IElementProjector } from '../resources/custom-element';
interface IElementTemplateProvider {
    getElementTemplate(renderingEngine: unknown, customElementType: unknown, parentContext: IServiceLocator): ITemplate;
}
declare type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & {
    render(flags: LifecycleFlags, host: T, parts: Record<string, TemplateDefinition>, parentContext: IServiceLocator): IElementTemplateProvider | void;
    created(flags: LifecycleFlags): void;
    binding(flags: LifecycleFlags): MaybePromiseOrTask;
    bound(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): MaybePromiseOrTask;
    unbound(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    attached(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    detached(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
}>;
export declare class Controller<T extends INode = INode, C extends IViewModel<T> = IViewModel<T>> implements IController<T, C> {
    private static readonly lookup;
    readonly id: number;
    nextBound?: Controller<T, C>;
    nextUnbound?: Controller<T, C>;
    prevBound?: Controller<T, C>;
    prevUnbound?: Controller<T, C>;
    nextAttached?: Controller<T, C>;
    nextDetached?: Controller<T, C>;
    prevAttached?: Controller<T, C>;
    prevDetached?: Controller<T, C>;
    nextMount?: Controller<T, C>;
    nextUnmount?: Controller<T, C>;
    prevMount?: Controller<T, C>;
    prevUnmount?: Controller<T, C>;
    readonly flags: LifecycleFlags;
    readonly viewCache?: IViewCache<T>;
    bindings?: IBinding[];
    controllers?: Controller<T, C>[];
    state: State;
    readonly lifecycle: ILifecycle;
    readonly hooks: HooksDefinition;
    readonly viewModel?: C;
    readonly bindingContext?: BindingContext<T, C>;
    readonly host?: T;
    readonly vmKind: ViewModelKind;
    scope?: IScope;
    projector?: IElementProjector;
    nodes?: INodeSequence<T>;
    context?: IContainer | IRenderContext<T>;
    location?: IRenderLocation<T>;
    readonly scopeParts: readonly string[];
    constructor(flags: LifecycleFlags, viewCache: IViewCache<T> | undefined, lifecycle: ILifecycle | undefined, viewModel: C | undefined, parentContext: IContainer | IRenderContext<T> | undefined, host: T | undefined, options: Partial<IElementHydrationOptions>, scopeParts: readonly string[]);
    static forCustomElement<T extends INode = INode>(viewModel: object, parentContext: IContainer | IRenderContext<T>, host: T, flags?: LifecycleFlags, options?: IElementHydrationOptions): Controller<T>;
    static forCustomAttribute<T extends INode = INode>(viewModel: object, parentContext: IContainer | IRenderContext<T>, flags?: LifecycleFlags, scopeParts?: readonly string[]): Controller<T>;
    static forSyntheticView<T extends INode = INode>(viewCache: IViewCache<T>, lifecycle: ILifecycle, flags?: LifecycleFlags): Controller<T>;
    lockScope(scope: IScope): void;
    hold(location: IRenderLocation<T>): void;
    release(flags: LifecycleFlags): boolean;
    bind(flags: LifecycleFlags, scope?: IScope): ILifecycleTask;
    unbind(flags: LifecycleFlags): ILifecycleTask;
    bound(flags: LifecycleFlags): void;
    unbound(flags: LifecycleFlags): void;
    attach(flags: LifecycleFlags): void;
    detach(flags: LifecycleFlags): void;
    attached(flags: LifecycleFlags): void;
    detached(flags: LifecycleFlags): void;
    mount(flags: LifecycleFlags): void;
    unmount(flags: LifecycleFlags): void;
    cache(flags: LifecycleFlags): void;
    getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
    private bindCustomElement;
    private bindCustomAttribute;
    private bindSynthetic;
    private bindBindings;
    private bindControllers;
    private endBind;
    private unbindCustomElement;
    private unbindCustomAttribute;
    private unbindSynthetic;
    private unbindBindings;
    private unbindControllers;
    private endUnbind;
    private attachCustomElement;
    private attachCustomAttribute;
    private attachSynthetic;
    private detachCustomElement;
    private detachCustomAttribute;
    private detachSynthetic;
    private attachControllers;
    private detachControllers;
    private mountCustomElement;
    private mountSynthetic;
    private unmountCustomElement;
    private unmountSynthetic;
    private cacheCustomElement;
    private cacheCustomAttribute;
    private cacheSynthetic;
}
export {};
//# sourceMappingURL=controller.d.ts.map