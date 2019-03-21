import { Reporter } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ISubscriber, PropertyObserver } from '../observation';
import { subscriberCollection } from './subscriber-collection';

const defineProperty = Reflect.defineProperty;
// note: we're reusing the same object for setting all descriptors, just changing some properties as needed
//   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
// see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
const observedPropertyDescriptor: PropertyDescriptor = {
  get: undefined,
  set: undefined,
  enumerable: true,
  configurable: true
};

function subscribe(this: PropertyObserver, subscriber: ISubscriber): void {
  if (this.observing === false) {
    this.observing = true;
    this.currentValue = this.obj[this.propertyKey!];
    if ((this.persistentFlags & LifecycleFlags.patchStrategy) === 0) {
      observedPropertyDescriptor.get = () => this.getValue();
      observedPropertyDescriptor.set = value => { this.setValue(value, LifecycleFlags.none); };
      if (!defineProperty(this.obj, this.propertyKey!, observedPropertyDescriptor)) {
        Reporter.write(1, this.propertyKey, this.obj);
      }
    }
  }
  this.addSubscriber(subscriber);
}

export function propertyObserver(): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    subscriberCollection()(target);
    const proto = target.prototype as PropertyObserver;

    proto.observing = false;
    proto.obj = null!;
    proto.propertyKey = null!;
    // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
    // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
    // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
    // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
    // This is likely not working correctly in vCurrent either.
    proto.currentValue = Symbol();

    proto.subscribe = proto.subscribe || subscribe;
    proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
  };
}
