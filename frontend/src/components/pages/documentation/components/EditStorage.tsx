import type { ComponentProps } from 'react';
import AddStorage from './AddStorage';

type EditStorageProps = Omit<ComponentProps<typeof AddStorage>, 'isEdit'>;

export default function EditStorage(props: EditStorageProps) {
	return <AddStorage {...props} isEdit />;
}
