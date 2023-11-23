type SystemTrayID = 'quit' | 'show' | 'setting' | 'about' | 'quit';

export interface SystemTrayPayload {
  id: SystemTrayID;
}
