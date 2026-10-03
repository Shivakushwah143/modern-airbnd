import tseslint from 'typescript-eslint';
export default tseslint.config({ignores:['**/node_modules/**','**/.next/**','**/dist/**','**/next-env.d.ts','test-results/**','docs/**']},...tseslint.configs.recommended,{rules:{'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_',caughtErrorsIgnorePattern:'^_'}],'@typescript-eslint/no-explicit-any':'error'}});
