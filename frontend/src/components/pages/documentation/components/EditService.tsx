import type { ComponentProps } from 'react';
import AddService from './AddService';

type EditServiceProps = Omit<ComponentProps<typeof AddService>, 'isEdit'>;

export default function EditService(props: EditServiceProps) {
	return <AddService {...props} isEdit />;
}
