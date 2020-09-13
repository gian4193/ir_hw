import axios from 'axios';

const HomeService = () => {
    const search = async (data) => {

        let d = (await axios.get('/full_text_search/muti_position/?keyword=' + data)).data;
        return d;
    }

    const getArticleById = async (id) => {
        let d = (await axios.get('/full_text_search/show_content/?id=' + id)).data;
        return d;
    }


    return {
        search: search,
        getArticleById: getArticleById
    }
}

export default HomeService;

