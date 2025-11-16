async function fetchDeposits() {
  try {
    const res = await fetch('/mock_api/deposits.json');
    const data = await res.json();
    const list = document.getElementById('deposits');
    list.innerHTML = '';
    data.forEach(d => {
      const li = document.createElement('li');
      li.textContent = `${d.deposit_id} — tx:${d.txid} — ${d.amount} — ${d.status || 'pending'}`;
      list.appendChild(li);
    });
  } catch (e) {
    console.error(e);
  }
}

async function fetchSubmissions() {
  try {
    const res = await fetch('/mock_api/submissions.json');
    const data = await res.json();
    const list = document.getElementById('submissions');
    list.innerHTML = '';
    data.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.deposit_id} — mina_tx:${s.mina_tx || 'n/a'} — ${s.status}`;
      list.appendChild(li);
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('refresh').addEventListener('click', fetchDeposits);
document.getElementById('refresh2').addEventListener('click', fetchSubmissions);

fetchDeposits();
fetchSubmissions();
