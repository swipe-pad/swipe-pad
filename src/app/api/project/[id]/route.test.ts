import { beforeEach, describe, expect, it, mock } from "bun:test"

const getProjectById = mock(async (_id: string): Promise<unknown | null> => {
  return null
})

const getFeedProject = mock(async () => ({
  project: null,
  nextCursor: "",
}))

mock.module("@/lib/feed-server", () => ({
  getFeedProject,
  getProjectById,
}))

const { GET } = await import("./route")

describe("GET /api/project/[id]", () => {
  beforeEach(() => {
    getProjectById.mockReset()
  })

  it("returns project when found", async () => {
    getProjectById.mockResolvedValueOnce({
      projectId: "p-1",
      routeId: "solar-dao",
      name: "Solar DAO",
    })

    const response = await GET(new Request("http://localhost/api/project/p-1"), {
      params: Promise.resolve({ id: "p-1" }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(getProjectById).toHaveBeenCalledWith("p-1")
    expect(body).toEqual({
      projectId: "p-1",
      routeId: "solar-dao",
      name: "Solar DAO",
    })
  })

  it("returns 404 when project is missing", async () => {
    getProjectById.mockResolvedValueOnce(null)

    const response = await GET(new Request("http://localhost/api/project/missing"), {
      params: Promise.resolve({ id: "missing" }),
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({ error: "Project not found" })
  })
})
