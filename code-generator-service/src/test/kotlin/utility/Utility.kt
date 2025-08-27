package utility

import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

object Utility {
    fun <T> monoOf(value: T?): Mono<T> =
        if (value != null) Mono.just(value)
        else Mono.empty()

    fun <T> fluxOf(vararg values: T): Flux<T> =
        if (values.isNotEmpty()) Flux.fromArray(values)
        else Flux.empty()
}
