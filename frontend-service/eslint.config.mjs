import js from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'

export default ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
    ...eslintPluginVue.configs['flat/recommended'],
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
            globals: {
                fetch: 'readonly',
                window: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                MouseEvent: 'readonly',
            },
        },
        rules: {
            'vue/no-v-html': 'off',
        },
    },
)
