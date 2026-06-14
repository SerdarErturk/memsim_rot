import http from "../../../../services/httpService";


class CommentStore {

  public async addComment(model: any) {
  
    let response = await http.post("/Comment/AddComment", model);
    var result = response.data.result
    return result;
  }

  public async getCommentData(sourceGuidId: any) {
  
    let response = await http.get("/Comment/GetCommentByGuid?sourceGuidId="+sourceGuidId);
    var result = response.data.result
    return result;
  }
  
}
export default  CommentStore;

