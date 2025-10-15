$(document).ready(function(){
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  function saveExpenses(){ localStorage.setItem("expenses", JSON.stringify(expenses)); }

  function renderExpenses(filterMonth="", searchName="", sortBy=""){
    $("#expense-list").empty();
    let filtered = expenses.filter(exp=>{
      return (!filterMonth || exp.date.startsWith(filterMonth)) &&
             (!searchName || exp.name.toLowerCase().includes(searchName.toLowerCase()));
    });

    if(sortBy==="amount") filtered.sort((a,b)=>b.amount-a.amount);
    if(sortBy==="name") filtered.sort((a,b)=>a.name.localeCompare(b.name));
    if(sortBy==="date") filtered.sort((a,b)=> new Date(b.date)- new Date(a.date));

    let total=0, top=0;
    filtered.forEach((exp, idx)=>{
      const colors={Food:'primary', Travel:'success', Bills:'warning', Entertainment:'danger', Other:'secondary'};
      const item=$(`
        <li class="list-group-item shadow-sm">
          <div>
            <strong>${exp.name}</strong>
            <span class="badge bg-${colors[exp.category]} badge-category">${exp.category}</span><br>
            <small>${exp.date}</small>
          </div>
          <div>
            ₹${parseFloat(exp.amount).toFixed(2)}
            <button class="btn btn-warning btn-sm btn-edit" data-index="${idx}"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-danger btn-sm btn-delete" data-index="${idx}"><i class="bi bi-trash"></i></button>
          </div>
        </li>
      `);
      $("#expense-list").append(item);
      total += parseFloat(exp.amount);
      if(exp.amount>top) top=exp.amount;
    });

    $("#total-amount").text(total.toFixed(2));
    $("#top-expense").text(top.toFixed(2));
  }

  // Add/Edit Expense
  $("#expense-form").submit(function(e){
    e.preventDefault();
    const name=$("#expense-name").val().trim();
    const amount=parseFloat($("#expense-amount").val());
    const date=$("#expense-date").val();
    const category=$("#expense-category").val();
    const editIndex=$("#edit-index").val();
    if(!name || !amount || !date || !category || amount<=0){ alert("Enter valid details"); return; }
    const expData={name, amount, date, category};
    if(editIndex!==""){ expenses[editIndex]=expData; } else { expenses.push(expData); }
    saveExpenses();
    renderExpenses($("#filter-month").val(), $("#search-name").val(), $("#sort-by").val());
    $("#expense-form")[0].reset();
    $("#edit-index").val("");
    var modal=bootstrap.Modal.getInstance(document.getElementById('expenseModal'));
    modal.hide();
  });

  // Edit/Delete
  $("#expense-list").on("click",".btn-edit",function(){
    const idx=$(this).data("index"), exp=expenses[idx];
    $("#expense-name").val(exp.name);
    $("#expense-amount").val(exp.amount);
    $("#expense-date").val(exp.date);
    $("#expense-category").val(exp.category);
    $("#edit-index").val(idx);
    $("#modal-title").text("Edit Expense");
    new bootstrap.Modal(document.getElementById('expenseModal')).show();
  });
  $("#expense-list").on("click",".btn-delete",function(){
    const idx=$(this).data("index");
    if(confirm("Delete this expense?")){ expenses.splice(idx,1); saveExpenses(); renderExpenses($("#filter-month").val(), $("#search-name").val(), $("#sort-by").val()); }
  });

  // Filters
  $("#filter-month, #search-name, #sort-by").on("change keyup", function(){
    renderExpenses($("#filter-month").val(), $("#search-name").val(), $("#sort-by").val());
  });

  // Reset
  $("#reset-data").click(function(){ if(confirm("Clear all expenses?")){ expenses=[]; saveExpenses(); renderExpenses(); } });

  // Save PDF
  $("#download-pdf").click(function(){
    if(expenses.length===0){ alert("No expenses to save"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Expense Report", 105, 15, null, null, "center");
    doc.setFontSize(12); 
    let y=25;
    expenses.forEach((e, idx)=>{
      doc.text(`${idx+1}. ${e.name} | ₹${e.amount.toFixed(2)} | ${e.date} | ${e.category}`, 10, y);
      y += 10; if(y>280){ doc.addPage(); y=20; }
    });
    doc.save("expenses.pdf");
  });

  renderExpenses();
});
