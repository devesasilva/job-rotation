import http from 'k6/http';
import { check, sleep } from 'k6';

const API = 'https://job-rotation-api.onrender.com';

export const options = {
  vus: 10,
  duration: '20s',
  
  thresholds: {
    'http_req_duration': ['p(95)<35000'], 
    'http_req_failed': ['rate<0.01'], 
  },
};

export default function () {
  const vuId = __VU; 
  const email = `user_${vuId}_${Date.now()}@test.com`;
  const password = 'Password123!';
  
  const headers = {
    'Content-Type': 'application/json',
  };

  const apiCheckRes = http.get(`${API}/api`);

  check(apiCheckRes, {
    '1. API Check Status 200 OK (Saúde da API)': (r) => r.status === 200,
  });
  
  if (apiCheckRes.status !== 200) {
      console.error(`VU ${vuId}: Health Check Falhou! Status: ${apiCheckRes.status}`);
      return; 
  }

  sleep(0.5); 
  const registerPayload = JSON.stringify({
    nome: `Test User ${vuId}`,
    email: email,
    senha: password, 
  });

  const registerRes = http.post(
    `${API}/auth/register`, 
    registerPayload,
    { headers: headers }
  );

  check(registerRes, {
    '2. Registro Status 201 Created OK': (r) => r.status === 201,
  });
  
  if (registerRes.status !== 201) {
      console.error(`VU ${vuId}: Falha no Registro. Status: ${registerRes.status}, Body: ${registerRes.body}`);
      return; 
  }

  sleep(0.5);
  const loginPayload = JSON.stringify({
    email: email,
    senha: password,
  });

  const loginRes = http.post(
    `${API}/auth/login`, 
    loginPayload,
    { headers: headers }
  );

  check(loginRes, {
    '3. Login Status 200 OK': (r) => r.status === 200,
    '3. Login Retorna Token': (r) => r.json() && r.json().token && r.json().token.length > 0, 
  });
  sleep(1);
}
