export interface FormStateBlock<T> {
  formState: T;
  onAlter: (f: (s: T) => T) => void;
  onSubmit: () => void;
}
