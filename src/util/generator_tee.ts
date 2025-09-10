/**
 * Create a pass-through generator that logs all inputs and outputs to console.
 *
 * @template TYield - The type of values yielded by the generator
 * @template TResult - The type of the final return value
 * @template TInput - The type of values that can be sent to the generator
 * @param startGenerator - A factory function that creates the generator to be wrapped
 * @returns A new generator that behaves identically to the original
 * @throws If the original generator throws
 */
export function* generatorTee<TYield, TResult, TInput>(
  startGenerator: () => Generator<TYield, TResult, TInput>,
): Generator<TYield, TResult, TInput> {
  let generator: Generator<TYield, TResult, TInput>
  let step = 0
  try {
    generator = startGenerator()
    let result = generator.next()

    while (!result.done) {
      console.debug({ step, yielded: result.value })

      const input = yield result.value
      console.debug({ step, input })

      step++
      result = generator.next(input)
    }

    console.debug({ step, returned: result.value })

    return result.value
  } catch (error) {
    console.debug({ step, error })
    throw error
  }
}
