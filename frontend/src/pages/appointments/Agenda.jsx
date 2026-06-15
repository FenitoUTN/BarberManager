import { useAuth } from '../../context/AuthContext';
import ClientAgenda from './ClientAgenda';
import StaffAgenda from './StaffAgenda';

function Agenda() {
  const { user } = useAuth();

  if (user?.rol === 'cliente') {
    return <ClientAgenda />;
  }

  return <StaffAgenda />;
}

export default Agenda;
