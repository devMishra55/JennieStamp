// ===================== NAVBAR =====================
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });
}

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }
});

// ===================== INDEX PAGE BLOGS =====================
const params = new URLSearchParams(window.location.search);
const blogId = params.get("id");

if (!blogId &&  (window.location.pathname.endsWith("/") ||
     window.location.pathname.endsWith("/index.html"))) {
  fetch("blogs.json")
    .then((res) => res.json())
    .then((data) => {
      // Main Post
      const mainPost = data.mainPost;
      const mainPostEl = document.getElementById("main-post");
      if (mainPostEl) {
        mainPostEl.innerHTML = `
          <img src="${mainPost.image}" alt="${mainPost.title}">
          <div class="category-date">
            <p class="blog-category">${mainPost.category}</p>
            <small class="blog-date">${mainPost.date}</small>
          </div>
          <h2>${mainPost.title}</h2>
          <p>${mainPost.excerpt}</p>
        `;
        mainPostEl.addEventListener("click", () => {
          window.location.href = `blog.html?id=main`;
        });
      }

      // Side Posts
      const sidePosts = data.sidePosts;
      const sideElements = ["side-1", "side-2", "side-3"];
      sideElements.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && sidePosts[i]) {
          el.innerHTML =
            i === 2
              ? createHorizontalPostHTML(sidePosts[i])
              : createPostHTML(sidePosts[i]);
          el.addEventListener("click", () => {
            window.location.href = `blog.html?id=${i}`;
          });
        }
      });
    });
}

function createPostHTML(post) {
  return `
    <article>
      <img src="${post.image}" alt="${post.title}">
      <div class="category-date">
        <p class="blog-category">${post.category}</p>
        <small class="blog-date">${post.date}</small>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
    </article>
  `;
}

function createHorizontalPostHTML(post) {
  return `
    <article class="horizontal-post">
      <img src="${post.image}" alt="${post.title}">
      <div class="post-text">
        <div class="category-date">
          <p class="blog-category">${post.category}</p>
          <small class="blog-date">${post.date}</small>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
      </div>
    </article>
  `;
}

// ===================== BLOG PAGE LOAD =====================
async function loadBlog() {
  const id = params.get("id");
  const featuredIndex = params.get("featured");
  const allIndex = params.get("all");
  let blog = null;

  if (id) {
    const res = await fetch("blogs.json");
    const data = await res.json();
    blog = id === "main" ? data.mainPost : data.sidePosts[Number(id)];
  } else if (featuredIndex !== null) {
    const res = await fetch("featuredBlogs.json");
    const data = await res.json();
    blog = data[Number(featuredIndex)];
  } else if (allIndex !== null) {
    const res = await fetch("allBlogs.json");
    const data = await res.json();
    blog = data[Number(allIndex)];
  }

  if (blog) {
    document.getElementById("blog-category").textContent = blog.category || "";
    document.getElementById("blog-date").textContent = blog.date || "";
    document.getElementById("blog-title").textContent = blog.title || "";
    document.getElementById("blog-excerpt").textContent = blog.excerpt || "";
    document.getElementById("blog-image").src = blog.image || "";
    document.getElementById("blog-image").alt = blog.title || "";
    // document.getElementById("blog-content").innerHTML = blog.content || "";
    const blogContentElement = document.getElementById("blog-content");

    if (blog.content) {
      // Split by closing paragraph tag
      let parts = blog.content.split("</p>");
      let modified = "";

      parts.forEach((part, index) => {
        if (part.trim()) {
          modified += part + "</p>";
          // After the 4th paragraph (index starts at 0)
          if (index === 3 && blog.contentImg) {
            modified += `<img src="${blog.contentImg}" alt="${blog.title}" class="inline-large-image">`;
          }
        }
      });

      blogContentElement.innerHTML = modified;
    } else {
      blogContentElement.innerHTML = "";
    }
  } else {
    document.getElementById("blog-title").textContent = "Blog Not Found";
    document.getElementById("blog-content").textContent =
      "Sorry, the blog you are looking for doesn't exist.";
  }
}

if (window.location.pathname.includes("blog.html")) {
  loadBlog();
}

// ===================== FEATURED BLOGS SLIDER (HOME) =====================
if (document.getElementById("featuredContainer")) {
  fetch("featuredBlogs.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("featuredContainer");
      data.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("featured-item");
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <p>${item.title}</p>
        `;
        card.addEventListener("click", () => {
          window.location.href = `blog.html?featured=${index}`;
        });
        container.appendChild(card);
      });
    });

  document.getElementById("prevBtn").addEventListener("click", () => {
    featuredContainer.scrollBy({ left: -250, behavior: "smooth" });
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    featuredContainer.scrollBy({ left: 250, behavior: "smooth" });
  });
}

// ===================== POPULAR BLOGS (BLOG PAGE) =====================
if (window.location.pathname.includes("blog.html")) {
  fetch("featuredBlogs.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("popular-blogs");
      data.slice(0, 4).forEach((item, index) => {
        const blogEl = document.createElement("div");
        blogEl.className = "popular-item";
        blogEl.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="info">
            <small>${item.category || ""} - ${item.date || ""}</small>
            <p>${item.title}</p>
          </div>
        `;
        blogEl.addEventListener("click", () => {
          window.location.href = `blog.html?featured=${index}`;
        });
        container.appendChild(blogEl);
      });
    });
}

// djslkjflad
// ===================== ALL BLOGS SECTION WITH ARROW NAVIGATION =====================
if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/"
) {
  let currentBlogIndex = 0; // Track which set of blogs we're showing
  let allBlogsData = []; // Store all blog data

  // Load the blog data
  fetch("allBlogs.json")
    .then((res) => res.json())
    .then((data) => {
      allBlogsData = data;
      displayBlogSet(0); // Show first set initially

      // Add arrow button functionality
      const prevBtn = document.getElementById("allBlogsPrev");
      const nextBtn = document.getElementById("allBlogsNext");

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentBlogIndex > 0) {
            currentBlogIndex -= 7; // Go back 7 posts
            displayBlogSet(currentBlogIndex);
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentBlogIndex + 7 < allBlogsData.length) {
            currentBlogIndex += 7; // Go forward 7 posts
            displayBlogSet(currentBlogIndex);
          }
        });
      }
    })
    .catch((error) => console.error("Error loading all blogs:", error));

  function displayBlogSet(startIndex) {
    const mainBlogContainer = document.getElementById("all-main-post");
    const trendingContainer = document.getElementById("trending-posts");

    // Get 7 blogs starting from startIndex
    const blogSet = allBlogsData.slice(startIndex, startIndex + 7);

    if (mainBlogContainer && blogSet.length > 0) {
      const mainBlog = blogSet[0];
      mainBlogContainer.innerHTML = `
    <img src="${mainBlog.image}" alt="${mainBlog.title}">
    <div class="category-date">
      <span class="blog-category">${mainBlog.category.toUpperCase()}</span>
      <span class="blog-date">Aug. ${String(
        14 - Math.floor(startIndex / 7)
      ).padStart(2, "0")}, 2025</span>
    </div>
    <h3>${mainBlog.title}</h3>
    <p>${mainBlog.excerpt}</p>
  `;

      // ✅ Direct click navigation
      mainBlogContainer.onclick = () => {
        window.location.href = `blog.html?all=${startIndex}`;
      };
    }

    if (trendingContainer && blogSet.length > 1) {
      const trendingPosts = blogSet.slice(1);
      trendingContainer.innerHTML = trendingPosts
        .map(
          (post, index) => `
      <div class="trending-item" data-index="${startIndex + index + 1}">
        <img src="${post.image}" alt="${post.title}">
        <div class="trending-content">
          <div class="category-date">
            <span class="blog-category">${post.category.toUpperCase()}</span>
            <span class="blog-date">Aug. ${String(
              13 - Math.floor(startIndex / 7) - index
            ).padStart(2, "0")}, 2025</span>
          </div>
          <h4>${post.title}</h4>
        </div>
      </div>
    `
        )
        .join("");

      // ✅ Click events for each trending post
      trendingContainer
        .querySelectorAll(".trending-item")
        .forEach((item, idx) => {
          const absoluteIndex = startIndex + 1 + idx;
          item.addEventListener("click", () => {
            window.location.href = `blog.html?all=${absoluteIndex}`;
          });
        });
    }

    // Update arrow button states
    updateArrowButtons();
  }

  function updateArrowButtons() {
    const prevBtn = document.getElementById("allBlogsPrev");
    const nextBtn = document.getElementById("allBlogsNext");

    if (prevBtn) {
      prevBtn.disabled = currentBlogIndex === 0;
      prevBtn.style.opacity = currentBlogIndex === 0 ? "0.5" : "1";
      prevBtn.style.cursor = currentBlogIndex === 0 ? "not-allowed" : "pointer";
    }

    if (nextBtn) {
      nextBtn.disabled = currentBlogIndex + 7 >= allBlogsData.length;
      nextBtn.style.opacity =
        currentBlogIndex + 7 >= allBlogsData.length ? "0.5" : "1";
      nextBtn.style.cursor =
        currentBlogIndex + 7 >= allBlogsData.length ? "not-allowed" : "pointer";
    }
  }
}
