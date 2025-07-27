const productsContainer = document.getElementById("products")
const pageNumbers = document.getElementById("page-numbers")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")
const successAlert = document.getElementById("success-alert")

let currentPage = 1
const limit = 3

// Fetch and Display Products
function fetchProducts(page) {
  const skip = (page - 1) * limit
  fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
    .then((res) => res.json())
    .then((data) => {
      displayProducts(data.products)
      updatePagination(page, Math.ceil(data.total / limit))
    })
    .catch((error) => {
      console.error("Error fetching products:", error)
    })
}

// Render Products
function displayProducts(products) {
  productsContainer.innerHTML = ""
  products.forEach((product) => {
    const col = document.createElement("div")
    col.className = "col-md-4"
    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${product.thumbnail}" class="card-img-top" alt="Product" onerror="this.src='/placeholder.svg?height=150&width=300'">
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text">$${product.price}</p>
          <button class="btn btn-warning btn-sm" onclick="putProduct(${product.id})">PUT</button>
          <button class="btn btn-info btn-sm" onclick="patchProduct(${product.id})">PATCH</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">DELETE</button>
        </div>
      </div>
    `
    productsContainer.appendChild(col)
  })
}

// Pagination Controls
function updatePagination(current, totalPages) {
  pageNumbers.innerHTML = ""
  let start = Math.max(1, current - 2)
  let end = Math.min(totalPages, current + 2)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(start + 4, totalPages)
    } else if (end === totalPages) {
      start = Math.max(end - 4, 1)
    }
  }

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button")
    btn.textContent = i
    btn.className = "btn btn-outline-primary"
    if (i === current) btn.classList.add("active")
    btn.onclick = () => {
      currentPage = i
      fetchProducts(i)
    }
    pageNumbers.appendChild(btn)
  }

  // Update arrow buttons functionality
  prevBtn.disabled = current === 1
  nextBtn.disabled = current === totalPages

  prevBtn.onclick = () => {
    if (current > 1) {
      currentPage = current - 1
      fetchProducts(currentPage)
    }
  }

  nextBtn.onclick = () => {
    if (current < totalPages) {
      currentPage = current + 1
      fetchProducts(currentPage)
    }
  }
}

// Show success alert
function showSuccessAlert(message) {
  successAlert.textContent = message
  successAlert.style.display = "block"
  setTimeout(() => {
    successAlert.style.display = "none"
  }, 3000)
}

// Add Product Form Handler
document.getElementById("add-form").addEventListener("submit", function (e) {
  e.preventDefault()

  const title = document.getElementById("title").value
  const price = document.getElementById("price").value
  const thumbnail = document.getElementById("thumbnail").value

  fetch("https://dummyjson.com/products/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      price: Number.parseFloat(price),
      thumbnail: thumbnail,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Reset form
      this.reset()

      // Go to first page
      currentPage = 1

      // Fetch first page products
      fetch(`https://dummyjson.com/products?limit=${limit}&skip=0`)
        .then((res) => res.json())
        .then((originalData) => {
          // Create the new product object with a temporary ID
          const newProduct = {
            id: Date.now(), // Use timestamp as temporary ID
            title: data.title,
            price: data.price,
            thumbnail: data.thumbnail || thumbnail,
          }

          // Add new product at the beginning and remove the last one to keep limit
          const updatedProducts = [newProduct, ...originalData.products.slice(0, limit - 1)]

          // Display the updated products list
          displayProducts(updatedProducts)
          updatePagination(currentPage, Math.ceil(originalData.total / limit))

          // Show success message
          showSuccessAlert(`✅ Product "${data.title}" added successfully and appears at the top!`)
        })
    })
    .catch((error) => {
      console.error("Error adding product:", error)
      alert("Error adding product. Please try again.")
    })
})

// PUT - Update entire product
function putProduct(id) {
  const newTitle = prompt("Enter full new title:")
  const newPrice = prompt("Enter full new price:")

  if (newTitle && newPrice) {
    fetch(`https://dummyjson.com/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        price: Number.parseFloat(newPrice),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Product updated (PUT)!")
        fetchProducts(currentPage)
      })
      .catch((error) => {
        console.error("Error updating product:", error)
        alert("Error updating product. Please try again.")
      })
  }
}

// PATCH - Update partial product
function patchProduct(id) {
  const newTitle = prompt("Enter new title:")

  if (newTitle) {
    fetch(`https://dummyjson.com/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Product updated (PATCH)!")
        fetchProducts(currentPage)
      })
      .catch((error) => {
        console.error("Error updating product:", error)
        alert("Error updating product. Please try again.")
      })
  }
}

// DELETE - Remove product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`https://dummyjson.com/products/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        alert("Product deleted!")
        fetchProducts(currentPage)
      })
      .catch((error) => {
        console.error("Error deleting product:", error)
        alert("Error deleting product. Please try again.")
      })
  }
}

// Initialize - Load first page
fetchProducts(currentPage)
