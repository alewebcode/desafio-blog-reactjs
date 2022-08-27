import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser,FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router'

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {
  const router = useRouter()

  const totalText = post.data.content.reduce((total,cur)=>{
    const totalHeading = cur.heading.split(' ').length;
    const totalBody = RichText.asText(cur.body).split(' ').length;

    return (total += totalHeading + totalBody)
  },0)

  const readTime = Math.ceil(totalText / 200)

  function formatDate(date:string){
    return format(new Date(date),"dd MMM yyyy",{locale: ptBR})
  }

  return(
    <div className={styles.container}>

      <img src={post.data.banner.url} alt="banner"/>

      <main className={styles.contentContainer}>

            {router.isFallback?<div>Carregando...</div>:null}

            <h1>{post.data.title}</h1>
            <div className={styles.info}>
             <span> <FiCalendar size={20} className={styles.icon}/>{formatDate(post.first_publication_date)}</span>
             <span> <FiUser size={20} className={styles.icon}/>{post.data.author}</span>
             <span> <FiClock size={20} className={styles.icon}/>{ `${readTime} min` }</span>
          </div>
          {post.data.content.map(text =>
            <article className={styles.post} key={text.heading}>
              <h3>{text.heading}</h3>
              <div dangerouslySetInnerHTML={{__html:RichText.asHtml(text.body)}} className={styles.postContent}>

              </div>
            </article>
          )}
      </main>
    </div>
  )
}

export const getStaticPaths = async ({props}) => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map((post) => ({
    params: { slug: post.uid },
  }))



  return {
    paths:[...paths],
    fallback:true
  }

};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;


  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts',String(slug),{});

  return {
    props:{
      post:response
    }
  }

};
