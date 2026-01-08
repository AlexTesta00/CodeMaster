package com.codemaster.solutionservice.utility

import codemaster.servicies.solution.domain.model.Solution
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

object Utility {
    fun <T : Any> monoOf(value: T?): Mono<T> =
        if (value != null) Mono.just(value)
        else Mono.empty()

    fun <T : Any> fluxOf(vararg values: T): Flux<T> =
        if (values.isNotEmpty()) Flux.fromArray(values)
        else Flux.empty()
}
