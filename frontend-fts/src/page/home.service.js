import axios from 'axios';

const HomeService = () => {
    const search = async (data) => {
        
        return (await axios.get('/full_text_search/keyword_search/?keyword=' + data)).data;;
    }


    return {
        search: search
    }
}

export default HomeService;

