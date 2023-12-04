# JSX转换

`<div id="app">Hello World!</div>` 到最终的...
此过程包含两部分，编译时跟运行时，编译的过程使用**babel**插件自动完成，运行时则需要调用`React.createElement`方法。接下来我们实现自己的`createElement`方法。

## 实现`createElement`方法

````const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'my_react'
	};
	return element;
};```

```export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}

	return ReactElement(type, key, ref, props);
};```

````

## 打包

需要处理commonJs规范(**@rollup/plugin-commonjs**)以及TS转换(**rollup-plugin-typescript2**)
**rimraf**用以每次打包前，将之前的打包文件删除
**rollup-plugin-generate-package-json**打包时生成package.json文件

## 调试

- 将打包后的文件链接至全局node_modules(**pnpm link --global**)
- 创建demo项目，并将React指向全局node_modules下的React(**pnpm link react --global**)
