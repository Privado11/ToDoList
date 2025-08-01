const GenerateReport = ({ tasks }) => {
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.statuses?.name === "Pending").length,
    inProgress: tasks.filter((t) => t.statuses?.name === "Progress").length,
    completed: tasks.filter((t) => t.statuses?.name === "Completed").length,
    shared: tasks.filter((t) => t.is_shared).length,
  };

   const formatDate = (dateString) => {
     if (!dateString) return "No date";
     return new Date(dateString).toLocaleDateString("en-US", {
       year: "numeric",
       month: "short",
       day: "numeric",
     });
   };


  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Management Report</title>
        <style>
          :root {
            --primary-color: #1e40af;
            --secondary-color: #3b82f6;
            --accent-color: #06b6d4;
            --success-color: #059669;
            --warning-color: #d97706;
            --danger-color: #dc2626;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--gray-800);
            background-color: var(--gray-50);
            font-size: 14px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: white;
            min-height: 100vh;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid var(--gray-200);
          }

          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 10px;
            letter-spacing: -0.025em;
          }

          .header .subtitle {
            font-size: 1.1rem;
            color: var(--gray-600);
            font-weight: 400;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }

          .stat-card {
            background: linear-gradient(135deg, white 0%, var(--gray-50) 100%);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary-color);
            display: block;
            margin-bottom: 8px;
            line-height: 1;
          }

          .stat-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--gray-900);
            margin: 40px 0 24px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid var(--primary-color);
            display: inline-block;
          }

          .task-grid {
            display: grid;
            gap: 20px;
          }

          .task-card {
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }

          .task-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: var(--secondary-color);
          }

          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            gap: 16px;
          }

          .task-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--gray-900);
            line-height: 1.3;
            flex: 1;
          }

          .task-status {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
          }

          .status-pending { 
            background: #fef3c7; 
            color: #92400e; 
            border: 1px solid #f59e0b;
          }
          .status-progress { 
            background: #dbeafe; 
            color: #1e40af; 
            border: 1px solid #3b82f6;
          }
          .status-completed { 
            background: #d1fae5; 
            color: #065f46; 
            border: 1px solid #10b981;
          }

          .task-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
            padding: 16px;
            background: var(--gray-50);
            border-radius: 8px;
            border: 1px solid var(--gray-200);
          }

          .meta-item {
            font-size: 0.875rem;
          }

          .meta-label {
            font-weight: 600;
            color: var(--gray-700);
            display: block;
            margin-bottom: 4px;
          }

          .meta-value {
            color: var(--gray-600);
          }

          .task-people {
            margin-bottom: 20px;
          }

          .people-section {
            margin-bottom: 16px;
          }

          .people-label {
            font-weight: 600;
            color: var(--gray-700);
            font-size: 0.875rem;
            margin-bottom: 8px;
            display: block;
          }

          .creator-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            color: #6b21a8;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid #c4b5fd;
          }

          .creator-badge::before {
            content: "👤";
            margin-right: 6px;
          }

          .collaborators-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .collaborator-badge {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            color: #047857;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid #a7f3d0;
          }

          .collaborator-badge::before {
            content: "👥";
            margin-right: 6px;
          }

          .no-collaborators {
            color: var(--gray-500);
            font-style: italic;
            font-size: 0.875rem;
          }

          .task-description {
            padding: 16px;
            background: var(--gray-50);
            border-radius: 8px;
            border-left: 4px solid var(--secondary-color);
            color: var(--gray-700);
            line-height: 1.6;
            font-size: 0.9rem;
          }

          .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid var(--gray-200);
            text-align: center;
          }

          .footer-content {
            color: var(--gray-600);
            font-size: 0.9rem;
            line-height: 1.5;
          }

          .footer-stats {
            margin-top: 16px;
            font-weight: 500;
            color: var(--primary-color);
          }

          @media (max-width: 768px) {
            .container {
              padding: 20px 16px;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 16px;
            }
            
            .task-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            
            .task-meta {
              grid-template-columns: 1fr;
              gap: 12px;
            }
          }

          @media print {
            body {
              background-color: white;
            }
            
            .task-card:hover {
              box-shadow: none;
              transform: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Task Management Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              }
            )}</p>
          </header>

          <section class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">${taskStats.total}</span>
              <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${taskStats.pending}</span>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${taskStats.inProgress}</span>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${taskStats.completed}</span>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${taskStats.shared}</span>
              <div class="stat-label">Shared With Me</div>
            </div>
          </section>

          <h2 class="section-title">Task Details</h2>
          <div class="task-grid">
            ${tasks
              .map(
                (task) => `
              <article class="task-card">
                <div class="task-header">
                  <h3 class="task-title">${task.title}</h3>
                  <span class="task-status status-${task.statuses?.name.toLowerCase()}">
                    ${task.statuses?.name}
                  </span>
                </div>
                
                <div class="task-meta">
                  <div class="meta-item">
                    <span class="meta-label">Priority</span>
                    <span class="meta-value">${task.priorities?.level}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Category</span>
                    <span class="meta-value">${
                      task.categories?.name || "Uncategorized"
                    }</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Due Date</span>
                    <span class="meta-value">${
                      task.due_date ? formatDate(task.due_date) : "No due date"
                    }</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Created</span>
                    <span class="meta-value">${formatDate(
                      task.create_at
                    )}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Shared Task</span>
                    <span class="meta-value">${
                      task.is_shared ? "Yes" : "No"
                    }</span>
                  </div>
                </div>

                <div class="task-people">
                  ${
                    task.is_shared && task.shared_by
                      ? `
                  <div class="people-section">
                    <span class="people-label">Task Creator</span>
                    <div class="creator-badge">
                      ${task.shared_by.full_name}
                    </div>
                  </div>
                  `
                      : ""
                  }
                  
                  <div class="people-section">
                    <span class="people-label">Collaborators</span>
                    ${
                      task.shared_tasks && task.shared_tasks.length > 0
                        ? `
                    <div class="collaborators-list">
                      ${task.shared_tasks
                        .map(
                          (collab) => `
                        <span class="collaborator-badge">
                          ${
                            collab.profile?.full_name ||
                            collab.full_name ||
                            "Unknown User"
                          }
                        </span>
                      `
                        )
                        .join("")}
                    </div>
                    `
                        : `
                    <div class="no-collaborators">No collaborators assigned</div>
                    `
                    }
                  </div>
                </div>
                
                ${
                  task.description
                    ? `<div class="task-description">${task.description}</div>`
                    : ""
                }
              </article>
            `
              )
              .join("")}
          </div>

          <footer class="footer">
            <div class="footer-content">
              <p>This comprehensive report provides an overview of your task management system.</p>
              <div class="footer-stats">
                ${taskStats.total} total tasks • ${
    [...new Set(tasks.map((t) => t.categories?.name).filter(Boolean))].length
  } categories • Generated automatically
              </div>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `;

  return html;
};

export default GenerateReport;
