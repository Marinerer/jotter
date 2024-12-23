export default {
	input: [
		{
			input: 'src/index.ts',
			name: 'kitify',
		},
		//==> type
		{
			input: 'src/type/type.ts',
			name: 'type',
		},
		{
			input: 'src/type/isType.ts',
			name: 'isType',
		},
		//==> object
		{
			input: 'src/object/assign.ts',
			name: 'assign',
		},
		//==> dom
		{
			input: 'src/dom/detectMouseDirection.ts',
			name: 'detectMouseDirection',
		},
	],
	formats: ['cjs', 'esm', 'umd'],
	target: ['es2015', 'es5'],
	outDir: 'dist',
}
