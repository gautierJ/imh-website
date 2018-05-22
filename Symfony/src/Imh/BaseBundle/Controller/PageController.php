<?php

namespace Imh\BaseBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class PageController extends Controller
{
    /**
     * @return array
     */
    public function detectDevice()
    {
        $mobileDetector = $this->get('mobile_detect.mobile_detector');
        $touchDevice = array();
        $touchDevice[0] = $mobileDetector->isMobile() || $mobileDetector->isTablet();
        $touchDevice[1] = $mobileDetector->isMobile();
        $touchDevice[2] = $mobileDetector->isTablet();

        return $touchDevice;
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(Request $request)
    {
        //if($request->isXmlHttpRequest()) {
            return $this->render('ImhBaseBundle:Page:index.html.twig', array(
                'isTouchDevice' => $this->detectDevice()[0]
            ));
        //}
    }


    public function biographyAction()
    {
        return $this->render('ImhBaseBundle:Page:biography.html.twig', array(
            'isTouchDevice' => $this->detectDevice()[0],
            'isMobileDevice' => $this->detectDevice()[1]
        ));
    }

    public function repertoireAction()
    {
        return $this->render('ImhBaseBundle:Page:repertoire.html.twig', array(
            'isTouchDevice' => $this->detectDevice()[0]
        ));
    }
}