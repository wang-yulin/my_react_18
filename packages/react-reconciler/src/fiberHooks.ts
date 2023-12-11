import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { FiberNode } from './fiber';
import internals from 'shared/internals';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { Action } from 'shared/ReactTypes';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

const { currentDispatcher } = internals;

export function renderWithHooks(wip: FiberNode) {
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;

	const current = wip.alternate;

	if (current !== null) {
		//update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	return children;
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function updateState<State>(): [State, Dispatch<State>] {
	//找到当前useState对应的hook数据
	const hook = updateWorkInProgressHook();
	//计算新的state
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;

	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
		hook.memoizedState = memoizedState;
	}

	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function updateWorkInProgressHook(): Hook {
	//TODO render阶段触发的更新
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		//这是这个FC update时的第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		//FC update时后续的hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行时的hook比上次执行时的多`
		);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		//mount时第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内使用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		//mount时后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}

function mountState<State>(
	initialState: () => State | State
): [State, Dispatch<State>] {
	//找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		//mount时第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内使用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		//mount时后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
