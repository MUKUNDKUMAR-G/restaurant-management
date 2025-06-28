const domain = "http://localhost:3000/api";

let refreshInProgress = false;
let refreshPromise = null;

export const http = async (urlApi, method, dataRequest) => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }

    const fetchOptions = {
      method: method,
      headers,
      credentials: "include",
      mode: "cors",
    };

    if (dataRequest) {
      fetchOptions.body = JSON.stringify(dataRequest);
    }

    let response = await fetch(`${domain}${urlApi}`, fetchOptions);
    const data = await response.json();

    // Handle token refresh if needed
    if (response.status === 401 && refreshToken) {
      try {
        // Don't try to refresh if we're already trying to refresh
        if (urlApi === "/auth/refresh") {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/staff/login";
          throw new Error("Session expired. Please login again.");
        }

        // Prevent parallel refreshes
        if (refreshInProgress) {
          await refreshPromise;
          // After refresh, retry the original request
          headers["authorization"] = `Bearer ${localStorage.getItem("token")}`;
          response = await fetch(`${domain}${urlApi}`, {
            ...fetchOptions,
            headers,
          });
          const retryData = await response.json();
          if (!response.ok) {
            throw new Error(retryData.message || "Request failed after token refresh");
          }
          return {
            status: response.status,
            data: retryData.data,
          };
        }
        refreshInProgress = true;
        refreshPromise = (async () => {
          const refreshResponse = await fetch(`${domain}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
            credentials: "include",
            mode: "cors",
          });

          const refreshData = await refreshResponse.json();

          if (!refreshResponse.ok || !refreshData.data) {
            // Clear tokens if refresh fails
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/staff/login";
            throw new Error("Session expired. Please login again.");
          }

          // Update tokens
          localStorage.setItem("token", refreshData.data.access_token);
          localStorage.setItem("refresh_token", refreshData.data.refresh_token);
        })();
        await refreshPromise;
        refreshInProgress = false;
        refreshPromise = null;
        // Update headers with new token
        headers["authorization"] = `Bearer ${localStorage.getItem("token")}`;
        // Retry the original request with new token
        response = await fetch(`${domain}${urlApi}`, {
          ...fetchOptions,
          headers,
        });
        const retryData = await response.json();
        if (!response.ok) {
          throw new Error(retryData.message || "Request failed after token refresh");
        }
        return {
          status: response.status,
          data: retryData.data,
        };
      } catch (refreshError) {
        refreshInProgress = false;
        refreshPromise = null;
        console.error("Token refresh error:", refreshError);
        // Clear tokens on refresh failure
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/staff/login";
        throw new Error("Session expired. Please login again.");
      }
    }

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/staff/login";
      throw new Error(data.message || "Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return {
      status: response.status,
      data: data.data,
    };
  } catch (error) {
    console.error("HTTP request error:", error);
    throw error;
  }
};
