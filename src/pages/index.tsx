import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar} from "react-icons/fi";
import { FiUser} from "react-icons/fi";
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import Link from "next/link";
import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}:HomeProps) {
  const [post,setPost] = useState(postsPagination.results)
  const [nextPage,setNextPage] = useState(postsPagination.next_page);
  // TODO

  function formatDate(date:string){
    return format(new Date(date),"dd MMM yyyy",{locale: ptBR})
  }


  return(
    <>
      <main className={styles.contentContainer}>
        {post.map(post => (
          <section key={post.uid}>
          <h1><Link href={`/post/${post.uid}`}>{post.data?.title}</Link></h1>
          <span>{post.data?.subtitle}</span>

          <div className={styles.info}>
             <span> <FiCalendar size={20} className={styles.icon}/> {formatDate(post.first_publication_date)}</span>
             <span> <FiUser size={20} className={styles.icon}/> {post.data?.author}</span>
          </div>
          </section>

        ))}
        {nextPage?(
          <div className={styles.pagination}>
            <span><a onClick={() => handleMore()}>Carregar mais posts</a></span>
          </div>
        ):null}

      </main>
    </>
  )

  function handleMore(){

   fetch(postsPagination.next_page)
   .then(response => response.json())
   .then(data => {
    setNextPage(data.next_page)
    const ret = data.results.map(post => {
        return {
        uid:post.uid,
        first_publication_date:post.first_publication_date,
        data:{
          title:post.data.title,
          subtitle:post.data.subtitle,
          author:post.data.author
        }
      }


    })

    setPost([...post,...ret])
  })

  }
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts',{pageSize:1});

  const results = postsResponse.results.map(post => {
    return {
      uid:post.uid,
      first_publication_date:post.first_publication_date,
      data:{
        title:post.data.title,
        subtitle:post.data.subtitle,
        author:post.data.author
      }

    }
  })

    //console.log(response.url)

  const postsPagination = {next_page:postsResponse.next_page,results:results}

  return {
    props:{
      postsPagination
    }
  }
  // TODO
};
