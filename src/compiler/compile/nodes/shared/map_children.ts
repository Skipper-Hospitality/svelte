import AwaitBlock from '../AwaitBlock';
import Body from '../Body';
import ConstTag from '../ConstTag';
import Comment from '../Comment';
import EachBlock from '../EachBlock';
import Element from '../Element';
import Head from '../Head';
import IfBlock from '../IfBlock';
import InlineComponent from '../InlineComponent';
import KeyBlock from '../KeyBlock';
import MustacheTag from '../MustacheTag';
import Options from '../Options';
import RawMustacheTag from '../RawMustacheTag';
import DebugTag from '../DebugTag';
import Slot from '../Slot';
import SlotTemplate from '../SlotTemplate';
import Text from '../Text';
import Title from '../Title';
import Window from '../Window';
import { TemplateNode } from '../../../interfaces';
import { push_array } from '../../../utils/push_array';

export type Children = ReturnType<typeof map_children>;

function get_constructor(type) {
	switch (type) {
		case 'AwaitBlock': return AwaitBlock;
		case 'Body': return Body;
		case 'Comment': return Comment;
		case 'ConstTag': return ConstTag;
		case 'EachBlock': return EachBlock;
		case 'Element': return Element;
		case 'Head': return Head;
		case 'IfBlock': return IfBlock;
		case 'InlineComponent': return InlineComponent;
		case 'KeyBlock': return KeyBlock;
		case 'MustacheTag': return MustacheTag;
		case 'Options': return Options;
		case 'RawMustacheTag': return RawMustacheTag;
		case 'DebugTag': return DebugTag;
		case 'Slot': return Slot;
		case 'SlotTemplate': return SlotTemplate;
		case 'Text': return Text;
		case 'Title': return Title;
		case 'Window': return Window;
		default: throw new Error(`Not implemented: ${type}`);
	}
}

function should_treat_as_element(child: TemplateNode) {
	switch (child.type) {
		case 'Slot':
			return child.attributes.some((attr) => attr.name === 'compiler-ignore' && attr.value);
		default: return false;
	}
}

export default function map_children(component, parent, scope, children: TemplateNode[]) {
	let last = null;
	let ignores = [];

	return children.map(child => {		
		if (should_treat_as_element(child)) {
			child.type = 'Element';
		}
		const constructor = get_constructor(child.type);

		const use_ignores = child.type !== 'Text' && child.type !== 'Comment' && ignores.length;

		if (use_ignores) component.push_ignores(ignores);
		const node = new constructor(component, parent, scope, child);
		if (use_ignores) component.pop_ignores(), ignores = [];

		if (node.type === 'Comment' && node.ignores.length) {
			push_array(ignores, node.ignores);
		}

		if (last) last.next = node;
		node.prev = last;
		last = node;

		return node;
	});
}
