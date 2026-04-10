import type { ComponentProps } from 'react';
import AddMarkdown from './AddMarkdown';

type EditMarkdownProps = Omit<ComponentProps<typeof AddMarkdown>, 'isEdit'>;

export default function EditMarkdown(props: EditMarkdownProps) {
	return <AddMarkdown {...props} isEdit />;
}
