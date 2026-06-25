import assert from 'node:assert/strict';

const baseUrl = 'http://localhost:3000';
const createResponse = await fetch(`${baseUrl}/api/interactive-map/pins`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    kind: 'city',
    name: 'delete regression',
    x: 1024,
    y: 2048,
    visibility: 'public',
  }),
});

assert.equal(createResponse.status, 200, '핀 생성에 실패했습니다.');

const createdPin = await createResponse.json();
const deleteUrl = `${baseUrl}/api/interactive-map/pins/${createdPin.id}`;

const firstDeleteResponse = await fetch(deleteUrl, {
  method: 'DELETE',
});

assert.equal(firstDeleteResponse.status, 200, '첫 번째 삭제가 실패했습니다.');

const secondDeleteResponse = await fetch(deleteUrl, {
  method: 'DELETE',
});

assert.equal(
  secondDeleteResponse.status,
  200,
  `두 번째 삭제가 200이어야 하지만 ${secondDeleteResponse.status}를 반환했습니다.`,
);

console.log('interactive-map delete regression: ok');
