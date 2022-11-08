export interface IAction {
  (): void
}

export interface IConsumer<T> {
  (value: T): void
}

export interface IBiConsumer<T, J> {
  (value0: T, value1: J): void
}

export interface IFunction<IN, OUT> {
  (input: IN): OUT
}

export interface IBiFunction<IN1, IN2, OUT> {
  (in1: IN1, in2: IN2): OUT
}
