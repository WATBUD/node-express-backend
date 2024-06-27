# Understanding `key` and `type` in React

## Introduction

In React, `key` is a crucial concept used to track which elements have changed, been added, or removed during the rendering process. Proper use of `key` helps React efficiently update the DOM, ensuring that only the necessary parts are re-rendered.

## What is `type` in React?

In React, `type` refers to the type of React element. It can be an HTML tag string, a React component class, or a function component. The type determines how React processes and renders the element.

### Specific meanings of `type`

1. **HTML Tag Strings**:
   - For native HTML elements, the type is a string representing the element's tag name, such as `'div'`, `'span'`, `'li'`, etc.

2. **React Component Classes**:
   - For components defined using ES6 classes, the type is the component class itself. For example, `class MyComponent extends React.Component {}`.

3. **Function Components**:
   - For function components, the type is the function itself. For example, `function MyComponent(props) {}`.

## Detailed Examples

``` javascript
### HTML Tag String Type
In this example, the type of <ul> and <li> is a string ('ul' and 'li').
const SimpleList = () => (
    <ul>
        <li key="1">Apple</li>
        <li key="2">Banana</li>
        <li key="3">Cherry</li>
    </ul>
);
```


``` javascript
### React Component Class Type
In this example, the type of <ListItem> is a React component class.

class ListItem extends React.Component {
    render() {
        return <li>{this.props.name}</li>;
    }
}

class SimpleList extends React.Component {
    render() {
        return (
            <ul>
                <ListItem key="1" name="Apple" />
                <ListItem key="2" name="Banana" />
                <ListItem key="3" name="Cherry" />
            </ul>
        );
    }
}
```

``` javascript
### Function Component Type 
In this example, the type of <ListItem> is a function component.
function ListItem(props) {
    return <li>{props.name}</li>;
}

function SimpleList() {
    return (
        <ul>
            <ListItem key="1" name="Apple" />
            <ListItem key="2" name="Banana" />
            <ListItem key="3" name="Cherry" />
        </ul>
    );
}


```
### How React Uses type
React uses the type to determine how to process and render elements:

1. Elements of the Same Type:

If the new and old elements have the same type (i.e., the same HTML tag, React component class, or function component), React considers them to be the same element. It then compares their properties (props) and state to decide how to update the DOM.

2. Elements of Different Types:

If the new and old elements have different types (e.g., from <div> to <span>, or from <ListItem> to <AnotherComponent>), React considers them to be different elements. It will unmount the old element and create and insert the new element.



``` javascript
class ItemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [
                { id: 1, name: 'Apple', color: 'red' },
                { id: 2, name: 'Banana', color: 'yellow' },
                { id: 3, name: 'Cherry', color: 'red' }
            ]
        };
    }

    updateItem = () => {
        const updatedItems = this.state.items.map(item => 
            item.id === 2 ? { ...item, name: 'Blueberry', color: 'blue' } : item
        );
        this.setState({ items: updatedItems });
    }

    render() {
        return (
            <div>
                <ul>
                    {this.state.items.map(item => (
                        <li key={item.id} style={{ color: item.color }}>
                            {item.name}
                        </li>
                    ))}
                </ul>
                <button onClick={this.updateItem}>Update Item</button>
            </div>
        );
    }
}

ReactDOM.render(<ItemList />, document.getElementById('root'));
```
Analysis
1. Initial Rendering:

Initially, the list renders Apple, Banana, and Cherry with colors red, yellow, and red respectively. React creates the virtual DOM tree and generates the corresponding real DOM.

2. Update Operation:

When the "Update Item" button is clicked, the updateItem function is called, updating the name of the item with id 2 to Blueberry and its color to blue.
this.setState triggers a re-render of the component.

3. Re-rendering:
React creates a new virtual DOM tree and compares it with the old virtual DOM tree.
For the item with id 2, React finds that the key and type are the same, so it considers them to be the same element.
React compares the new and old element's properties, finding that the name and color properties have changed. Therefore, it updates the corresponding parts of the DOM instead of recreating the entire li element.
Conclusion

### Conclusion
In React, the type (type) can be an HTML tag string, a React component class, or a function component.
React uses the type and key to determine if elements are the same, deciding whether to update existing elements or create new ones.
Using unique and stable key values and correct types helps React efficiently update the DOM and improve rendering performance.



# 总结
虚拟DOM更新：首先，React在内存中创建新的虚拟DOM树，并将其与旧的虚拟DOM树进行比较。
实际DOM更新：然后，React根据虚拟DOM的比较结果，找出需要更新的部分，并将这些变化应用到实际的DOM中。
# React的diff算法 是基于树（Tree）的结构
1. 树分层比较：
React会逐层比较新旧虚拟DOM树，从根节点开始，逐层向下进行比较。

同层节点比较：

在同一层内，React会依次比较每个节点的key和类型。如果key和类型相同，则认为是同一个节点，只更新属性；如果不同，则销毁旧节点，创建新节点。
最小化更新：

React会尽可能只更新发生变化的部分，最小化实际的DOM操作，从而提高性能。