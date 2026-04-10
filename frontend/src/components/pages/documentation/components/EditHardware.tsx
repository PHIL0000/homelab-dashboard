import type { ComponentProps } from 'react';
import AddHardware from './AddHardware';

type EditHardwareProps = Omit<ComponentProps<typeof AddHardware>, 'isEdit'>;

export default function EditHardware(props: EditHardwareProps) {
	return <AddHardware {...props} isEdit />;
}
