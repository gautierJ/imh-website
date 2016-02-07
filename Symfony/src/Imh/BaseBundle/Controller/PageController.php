<?php

namespace Imh\BaseBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class PageController extends Controller
{
    public function indexAction(Request $request)
    {
        //if($request->isXmlHttpRequest()) {
            return $this->render('ImhBaseBundle:Page:index.html.twig');
        //}
    }

    public function biographyAction()
    {
        return $this->render('ImhBaseBundle:Page:biography.html.twig');
    }

    public function repertoireAction()
    {
        return $this->render('ImhBaseBundle:Page:repertoire.html.twig');
    }
}