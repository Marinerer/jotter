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
		{
			input: 'src/object/clone.ts',
			name: 'clone',
		},
		{
			input: 'src/object/cloneDeep.ts',
			name: 'cloneDeep',
			target: ['es2015'],
		},
		{
			input: 'src/object/cloneLoop.ts',
			name: 'cloneLoop',
			target: ['es2015'],
		},
		{
			input: 'src/object/cloneJSON.ts',
			name: 'cloneJSON',
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
